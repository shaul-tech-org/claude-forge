<?php

declare(strict_types=1);

namespace App\Services\Harness;

use App\DTOs\Harness\ContextBudget;

final class ContextBudgetCalculator
{
    private const int DEFAULT_CAPACITY = 256_000;

    // Approximate token-per-byte ratios for different content types
    private const float BYTES_PER_TOKEN = 4.0;

    // Fixed system overhead estimates
    private const int SYSTEM_PROMPT_TOKENS = 3_200;
    private const int SYSTEM_TOOLS_TOKENS = 11_000;

    // Per-item token estimates
    private const int AGENT_FRONTMATTER_TOKENS = 400;
    private const int SKILL_DEFINITION_TOKENS = 300;
    private const int RULE_CONTENT_TOKENS = 500;
    private const int HOOK_CONFIG_TOKENS = 100;
    private const int MEMORY_BASE_TOKENS = 800;

    /**
     * @param array{
     *   agents?: array<array<string, mixed>>,
     *   rules?: array<array<string, mixed>>,
     *   claudeMd?: string,
     *   memory?: bool,
     *   skills?: array<array<string, mixed>>,
     *   hooks?: array<string, mixed>,
     * } $config
     */
    public function calculate(array $config, int $capacity = self::DEFAULT_CAPACITY): ContextBudget
    {
        $breakdown = [];
        $warnings = [];

        // System prompt (always present)
        $breakdown['system_prompt'] = self::SYSTEM_PROMPT_TOKENS;

        // System tools
        $breakdown['system_tools'] = self::SYSTEM_TOOLS_TOKENS;

        // CLAUDE.md
        $claudeMd = $config['claudeMd'] ?? '';
        $breakdown['claude_md'] = $this->estimateTokens($claudeMd);

        // Rules
        $rules = $config['rules'] ?? [];
        $ruleTokens = 0;
        foreach ($rules as $rule) {
            $content = $rule['content'] ?? '';
            $ruleTokens += $content ? $this->estimateTokens($content) : self::RULE_CONTENT_TOKENS;
        }
        $breakdown['rules'] = $ruleTokens;

        // Agent frontmatter
        $agents = $config['agents'] ?? [];
        $agentTokens = 0;
        foreach ($agents as $agent) {
            $instructions = $agent['instructions'] ?? '';
            $agentTokens += $instructions
                ? self::AGENT_FRONTMATTER_TOKENS + $this->estimateTokens($instructions)
                : self::AGENT_FRONTMATTER_TOKENS;
        }
        $breakdown['agents'] = $agentTokens;

        // Skills
        $skills = $config['skills'] ?? [];
        $breakdown['skills'] = count($skills) * self::SKILL_DEFINITION_TOKENS;

        // Hooks
        $hooks = $config['hooks'] ?? [];
        $hookCount = 0;
        foreach ($hooks as $hookList) {
            if (is_array($hookList)) {
                $hookCount += count($hookList);
            }
        }
        $breakdown['hooks'] = $hookCount * self::HOOK_CONFIG_TOKENS;

        // Memory
        $hasMemory = $config['memory'] ?? false;
        $breakdown['memory'] = $hasMemory ? self::MEMORY_BASE_TOKENS : 0;

        // Calculate totals
        $fixedUsage = array_sum($breakdown);
        $available = max(0, $capacity - $fixedUsage);
        $utilization = $fixedUsage / $capacity;

        // Warnings
        if ($utilization > 0.3) {
            $warnings[] = '고정 컨텍스트가 전체 용량의 30%를 초과합니다. 규칙이나 에이전트 instructions를 정리하세요.';
        }
        if ($breakdown['claude_md'] > 5000) {
            $warnings[] = 'CLAUDE.md가 너무 깁니다. 핵심 정보만 유지하고 상세 내용은 규칙 파일로 분리하세요.';
        }
        if (count($agents) > 5 && $agentTokens > 5000) {
            $warnings[] = '에이전트가 많고 instructions이 깁니다. 공통 규칙은 Rules로 분리하세요.';
        }

        return new ContextBudget(
            totalCapacity: $capacity,
            fixedUsage: $fixedUsage,
            available: $available,
            utilization: $utilization,
            breakdown: $breakdown,
            warnings: $warnings,
        );
    }

    private function estimateTokens(string $content): int
    {
        if ($content === '') {
            return 0;
        }

        return (int) ceil(strlen($content) / self::BYTES_PER_TOKEN);
    }
}
