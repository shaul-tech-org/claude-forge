<?php

declare(strict_types=1);

namespace App\Services\Cli;

use App\DTOs\Cli\AgentConfig;
use App\DTOs\Cli\RuleConfig;
use App\DTOs\Cli\ScanResult;
use App\DTOs\Cli\SkillConfig;

class ClaudeConfigScanner
{
    public function __construct(
        private readonly FrontmatterParser $parser,
    ) {}

    public function scan(string $projectPath): ScanResult
    {
        $basePath = rtrim($projectPath, '/') . '/.claude';

        return new ScanResult(
            agents: $this->scanAgents($basePath),
            skills: $this->scanSkills($basePath),
            rules: $this->scanRules($basePath),
            projectPath: $projectPath,
        );
    }

    /**
     * @return AgentConfig[]
     */
    private function scanAgents(string $basePath): array
    {
        $agentsDir = $basePath . '/agents';
        if (! is_dir($agentsDir)) {
            return [];
        }

        $agents = [];
        foreach ($this->globMarkdownFiles($agentsDir) as $file) {
            $parsed = $this->parser->parse(file_get_contents($file));
            $meta = $parsed['meta'];

            $agents[] = AgentConfig::fromArray([
                'name' => $meta['name'] ?? $this->filenameWithoutExtension($file),
                'description' => $meta['description'] ?? '',
                'model' => $meta['model'] ?? 'sonnet',
                'instructions' => $parsed['body'],
            ]);
        }

        return $agents;
    }

    /**
     * @return SkillConfig[]
     */
    private function scanSkills(string $basePath): array
    {
        $skillsDir = $basePath . '/skills';
        if (! is_dir($skillsDir)) {
            return [];
        }

        $skills = [];
        foreach ($this->globMarkdownFilesRecursive($skillsDir) as $file) {
            $parsed = $this->parser->parse(file_get_contents($file));
            $meta = $parsed['meta'];

            $skills[] = SkillConfig::fromArray([
                'name' => $meta['name'] ?? $this->filenameWithoutExtension($file),
                'description' => $meta['description'] ?? '',
                'userInvocable' => $meta['userInvocable'] ?? $meta['user_invocable'] ?? true,
                'args' => $meta['args'] ?? [],
                'trigger' => $meta['trigger'] ?? '',
                'instructions' => $parsed['body'],
            ]);
        }

        return $skills;
    }

    /**
     * @return RuleConfig[]
     */
    private function scanRules(string $basePath): array
    {
        $rulesDir = $basePath . '/rules';
        if (! is_dir($rulesDir)) {
            return [];
        }

        $rules = [];
        foreach ($this->globMarkdownFilesRecursive($rulesDir) as $file) {
            $parsed = $this->parser->parse(file_get_contents($file));
            $meta = $parsed['meta'];

            // Derive category from subdirectory path relative to rules/
            $relativePath = str_replace($rulesDir . '/', '', $file);
            $category = dirname($relativePath);
            if ($category === '.') {
                $category = '';
            }

            $rules[] = RuleConfig::fromArray([
                'label' => $meta['label'] ?? $this->filenameWithoutExtension($file),
                'category' => $meta['category'] ?? $category,
                'paths' => $meta['paths'] ?? [],
                'content' => $parsed['body'],
            ]);
        }

        return $rules;
    }

    /**
     * @return string[]
     */
    private function globMarkdownFiles(string $dir): array
    {
        $pattern = $dir . '/*.md';
        $files = glob($pattern);

        return $files !== false ? $files : [];
    }

    /**
     * @return string[]
     */
    private function globMarkdownFilesRecursive(string $dir): array
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
        );

        $files = [];
        foreach ($iterator as $file) {
            /** @var \SplFileInfo $file */
            if ($file->isFile() && strtolower($file->getExtension()) === 'md') {
                $files[] = $file->getPathname();
            }
        }

        sort($files);

        return $files;
    }

    private function filenameWithoutExtension(string $path): string
    {
        return pathinfo($path, PATHINFO_FILENAME);
    }
}
