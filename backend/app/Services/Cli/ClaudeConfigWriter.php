<?php

declare(strict_types=1);

namespace App\Services\Cli;

use App\DTOs\Cli\AgentConfig;
use App\DTOs\Cli\ApplyResult;
use App\DTOs\Cli\ClaudeConfig;
use App\DTOs\Cli\RuleConfig;
use App\DTOs\Cli\SkillConfig;

class ClaudeConfigWriter
{
    public function __construct(
        private readonly FrontmatterParser $parser,
    ) {}

    public function apply(string $projectPath, ClaudeConfig $config, string $mode = 'merge'): ApplyResult
    {
        $basePath = rtrim($projectPath, '/') . '/.claude';

        $created = [];
        $updated = [];
        $skipped = [];

        foreach ($config->agents as $agent) {
            $filePath = $basePath . '/agents/' . $this->slug($agent->name) . '.md';
            $result = $this->writeFile(
                filePath: $filePath,
                content: $this->generateAgentContent($agent),
                mode: $mode,
            );
            $this->categorizeResult($result, $filePath, $created, $updated, $skipped);
        }

        foreach ($config->skills as $skill) {
            $skillDir = $this->slug($skill->name);
            $filePath = $basePath . '/skills/' . $skillDir . '/' . $this->slug($skill->name) . '.md';
            $result = $this->writeFile(
                filePath: $filePath,
                content: $this->generateSkillContent($skill),
                mode: $mode,
            );
            $this->categorizeResult($result, $filePath, $created, $updated, $skipped);
        }

        foreach ($config->rules as $rule) {
            $category = $rule->category !== '' ? $rule->category . '/' : '';
            $filePath = $basePath . '/rules/' . $category . $this->slug($rule->label) . '.md';
            $result = $this->writeFile(
                filePath: $filePath,
                content: $this->generateRuleContent($rule),
                mode: $mode,
            );
            $this->categorizeResult($result, $filePath, $created, $updated, $skipped);
        }

        return new ApplyResult(
            created: $created,
            updated: $updated,
            skipped: $skipped,
        );
    }

    private function generateAgentContent(AgentConfig $agent): string
    {
        $meta = array_filter([
            'name' => $agent->name,
            'description' => $agent->description,
            'model' => $agent->model,
        ], static fn(string $v): bool => $v !== '');

        return $this->parser->generate(meta: $meta, body: $agent->instructions);
    }

    private function generateSkillContent(SkillConfig $skill): string
    {
        $meta = array_filter([
            'name' => $skill->name,
            'description' => $skill->description,
            'userInvocable' => $skill->userInvocable,
            'trigger' => $skill->trigger,
        ], static fn(mixed $v): bool => $v !== '' && $v !== false);

        if ($skill->args !== []) {
            $meta['args'] = $skill->args;
        }

        if ($skill->userInvocable) {
            $meta['userInvocable'] = true;
        }

        return $this->parser->generate(meta: $meta, body: $skill->instructions);
    }

    private function generateRuleContent(RuleConfig $rule): string
    {
        $meta = array_filter([
            'label' => $rule->label,
            'category' => $rule->category,
        ], static fn(string $v): bool => $v !== '');

        if ($rule->paths !== []) {
            $meta['paths'] = $rule->paths;
        }

        return $this->parser->generate(meta: $meta, body: $rule->content);
    }

    /**
     * @return 'created'|'updated'|'skipped'
     */
    private function writeFile(string $filePath, string $content, string $mode): string
    {
        $exists = file_exists($filePath);

        if ($exists && $mode === 'merge') {
            return 'skipped';
        }

        $dir = dirname($filePath);
        if (! is_dir($dir)) {
            mkdir($dir, recursive: true);
        }

        file_put_contents($filePath, $content);

        return $exists ? 'updated' : 'created';
    }

    /**
     * @param string[] $created
     * @param string[] $updated
     * @param string[] $skipped
     */
    private function categorizeResult(
        string $result,
        string $filePath,
        array &$created,
        array &$updated,
        array &$skipped,
    ): void {
        match ($result) {
            'created' => $created[] = $filePath,
            'updated' => $updated[] = $filePath,
            'skipped' => $skipped[] = $filePath,
        };
    }

    private function slug(string $name): string
    {
        $slug = strtolower($name);
        $slug = (string) preg_replace('/[^a-z0-9\-_]/', '-', $slug);
        $slug = (string) preg_replace('/-+/', '-', $slug);

        return trim($slug, '-');
    }
}
