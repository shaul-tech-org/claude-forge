<?php

declare(strict_types=1);

namespace App\Services\Harness;

use Illuminate\Support\Facades\Http;

final class GitHubImportService
{
    /**
     * Extract .claude/ directory contents from a GitHub repository URL.
     *
     * @return array{
     *   agents: array<array<string, string>>,
     *   skills: array<array<string, string>>,
     *   rules: array<array<string, string>>,
     *   claudeMd: string,
     *   settings: array<string, mixed>,
     * }
     */
    public function import(string $url): array
    {
        [$owner, $repo, $branch] = $this->parseUrl($url);

        // Use GitHub API to get the .claude/ directory tree
        $treeSha = $this->getClaudeTreeSha($owner, $repo, $branch);

        if ($treeSha === null) {
            return [
                'agents' => [],
                'skills' => [],
                'rules' => [],
                'claudeMd' => '',
                'settings' => [],
            ];
        }

        return $this->fetchClaudeContents($owner, $repo, $treeSha);
    }

    /**
     * @return array{string, string, string}
     */
    private function parseUrl(string $url): array
    {
        // Support formats:
        // https://github.com/owner/repo
        // https://github.com/owner/repo/tree/branch
        $url = rtrim($url, '/');
        $path = parse_url($url, PHP_URL_PATH) ?? '';
        $parts = array_values(array_filter(explode('/', $path)));

        $owner = $parts[0] ?? '';
        $repo = $parts[1] ?? '';
        $branch = 'main';

        if (count($parts) >= 4 && $parts[2] === 'tree') {
            $branch = $parts[3];
        }

        return [$owner, $repo, $branch];
    }

    private function getClaudeTreeSha(string $owner, string $repo, string $branch): ?string
    {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
        ])->get("https://api.github.com/repos/{$owner}/{$repo}/git/trees/{$branch}", [
            'recursive' => 'false',
        ]);

        if (! $response->successful()) {
            return null;
        }

        $tree = $response->json('tree', []);

        foreach ($tree as $item) {
            if ($item['path'] === '.claude' && $item['type'] === 'tree') {
                return $item['sha'];
            }
        }

        return null;
    }

    /**
     * @return array{
     *   agents: array<array<string, string>>,
     *   skills: array<array<string, string>>,
     *   rules: array<array<string, string>>,
     *   claudeMd: string,
     *   settings: array<string, mixed>,
     * }
     */
    private function fetchClaudeContents(string $owner, string $repo, string $treeSha): array
    {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
        ])->get("https://api.github.com/repos/{$owner}/{$repo}/git/trees/{$treeSha}", [
            'recursive' => 'true',
        ]);

        if (! $response->successful()) {
            return [
                'agents' => [],
                'skills' => [],
                'rules' => [],
                'claudeMd' => '',
                'settings' => [],
            ];
        }

        $tree = $response->json('tree', []);
        $result = [
            'agents' => [],
            'skills' => [],
            'rules' => [],
            'claudeMd' => '',
            'settings' => [],
        ];

        foreach ($tree as $item) {
            if ($item['type'] !== 'blob') {
                continue;
            }

            $path = $item['path'];
            $content = $this->fetchBlobContent($owner, $repo, $item['sha']);

            if ($path === 'CLAUDE.md') {
                $result['claudeMd'] = $content;
            } elseif (str_starts_with($path, 'agents/') && str_ends_with($path, '.md')) {
                $name = pathinfo($path, PATHINFO_FILENAME);
                $result['agents'][] = [
                    'name' => $name,
                    'label' => $name,
                    'description' => mb_substr($content, 0, 200),
                    'content' => $content,
                ];
            } elseif (str_starts_with($path, 'skills/') && str_ends_with($path, '.md')) {
                $name = pathinfo($path, PATHINFO_FILENAME);
                $result['skills'][] = [
                    'name' => $name,
                    'label' => $name,
                    'description' => mb_substr($content, 0, 200),
                ];
            } elseif (str_starts_with($path, 'rules/') && str_ends_with($path, '.md')) {
                $name = pathinfo($path, PATHINFO_FILENAME);
                $result['rules'][] = [
                    'name' => $name,
                    'label' => $name,
                    'content' => $content,
                    'description' => mb_substr($content, 0, 200),
                ];
            } elseif ($path === 'settings.json') {
                $result['settings'] = json_decode($content, true) ?? [];
            }
        }

        return $result;
    }

    private function fetchBlobContent(string $owner, string $repo, string $sha): string
    {
        $response = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
        ])->get("https://api.github.com/repos/{$owner}/{$repo}/git/blobs/{$sha}");

        if (! $response->successful()) {
            return '';
        }

        $encoding = $response->json('encoding');
        $content = $response->json('content', '');

        if ($encoding === 'base64') {
            return base64_decode($content) ?: '';
        }

        return $content;
    }
}
