<?php

declare(strict_types=1);

namespace App\Services\Cli;

use Symfony\Component\Yaml\Yaml;

class FrontmatterParser
{
    /**
     * Parse a Markdown file with optional YAML frontmatter.
     *
     * @return array{meta: array<string, mixed>, body: string}
     */
    public function parse(string $markdown): array
    {
        $markdown = ltrim($markdown);

        if (! str_starts_with($markdown, '---')) {
            return [
                'meta' => [],
                'body' => $markdown,
            ];
        }

        $parts = preg_split('/^---\s*$/m', $markdown, limit: 3);

        if ($parts === false || count($parts) < 3) {
            return [
                'meta' => [],
                'body' => $markdown,
            ];
        }

        $yamlContent = trim($parts[1]);
        $body = ltrim($parts[2], "\n\r");

        $meta = [];
        if ($yamlContent !== '') {
            $parsed = Yaml::parse($yamlContent);
            $meta = is_array($parsed) ? $parsed : [];
        }

        return [
            'meta' => $meta,
            'body' => $body,
        ];
    }

    /**
     * Generate a Markdown string with YAML frontmatter.
     *
     * @param array<string, mixed> $meta
     */
    public function generate(array $meta, string $body): string
    {
        $output = "---\n";
        $output .= Yaml::dump($meta, inline: 2, indent: 2);
        $output .= "---\n";
        $output .= $body;

        return $output;
    }
}
