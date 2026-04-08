<?php

declare(strict_types=1);

namespace App\Services\Harness;

use App\DTOs\Harness\Pattern;
use App\Services\Recommendation\RecommendationEngine;

final class HarnessRecommendationService
{
    public function __construct(
        private readonly PatternRegistry $patternRegistry,
        private readonly RecommendationEngine $recommendationEngine,
    ) {}

    /**
     * Chain recommendation: stacks → pattern → agents → skills → rules → hooks.
     *
     * @param string[] $stacks
     * @param string[] $workTypes
     * @param string[] $priorities
     * @return array{
     *   patterns: array<array<string, mixed>>,
     *   agents: array<array<string, mixed>>,
     *   skills: array<array<string, mixed>>,
     *   rules: array<array<string, mixed>>,
     *   hooks: array<array<string, mixed>>,
     *   context_budget_estimate: int,
     * }
     */
    public function recommend(
        array $stacks,
        int $teamSize = 1,
        array $workTypes = [],
        array $priorities = [],
    ): array {
        // Step 1: Get base recommendations from existing engine
        $baseRecommendation = $this->recommendationEngine->recommend($stacks);

        // Step 2: Recommend patterns
        $patterns = $this->recommendPatterns($teamSize, $workTypes, $priorities);

        // Step 3: Recommend agents based on pattern
        $agents = $this->recommendAgents($patterns, $teamSize);

        // Step 4: Recommend skills based on work types
        $skills = $this->recommendSkills($workTypes, $baseRecommendation);

        // Step 5: Use existing rules from RecommendationEngine
        $rules = array_map(static fn ($r) => $r->toArray(), $baseRecommendation->rules);

        // Step 6: Recommend hooks based on priorities
        $hooks = $this->recommendHooks($priorities);

        // Step 7: Estimate context budget
        $budgetEstimate = $this->estimateContextBudget($agents, $skills, $rules);

        return [
            'patterns' => array_map(static fn (Pattern $p) => $p->toSummary(), $patterns),
            'agents' => $agents,
            'skills' => $skills,
            'rules' => $rules,
            'hooks' => $hooks,
            'context_budget_estimate' => $budgetEstimate,
        ];
    }

    /** @return Pattern[] */
    private function recommendPatterns(int $teamSize, array $workTypes, array $priorities): array
    {
        $all = $this->patternRegistry->all();
        $scored = [];

        foreach ($all as $pattern) {
            $score = 0;

            // Team size fitness
            $sizes = explode('-', $pattern->teamSize);
            $min = (int) $sizes[0];
            $max = (int) ($sizes[1] ?? $sizes[0]);
            if ($teamSize >= $min && $teamSize <= $max) {
                $score += 40;
            } elseif (abs($teamSize - ($min + $max) / 2) <= 2) {
                $score += 20;
            }

            // Work type alignment
            if (in_array('review', $workTypes) && in_array($pattern->id, ['producer-reviewer', 'three-agent'])) {
                $score += 30;
            }
            if (in_array('testing', $workTypes) && in_array($pattern->id, ['pipeline', 'producer-reviewer'])) {
                $score += 20;
            }
            if (in_array('devops', $workTypes) && in_array($pattern->id, ['fan-out-fan-in', 'expert-pool'])) {
                $score += 20;
            }

            // Priority alignment
            foreach ($priorities as $priority) {
                $axisScore = $pattern->expectedScores[$priority] ?? 0;
                $score += (int) ($axisScore * 0.3);
            }

            $scored[] = ['pattern' => $pattern, 'score' => $score];
        }

        usort($scored, static fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_map(static fn ($item) => $item['pattern'], array_slice($scored, 0, 3));
    }

    /** @return array<array<string, mixed>> */
    private function recommendAgents(array $patterns, int $teamSize): array
    {
        $agents = [];
        $seenRoles = [];

        foreach ($patterns as $pattern) {
            foreach ($pattern->recommendedAgents as $agentRole) {
                if (in_array($agentRole, $seenRoles)) {
                    continue;
                }
                $seenRoles[] = $agentRole;
                $agents[] = [
                    'role' => $agentRole,
                    'model' => $this->suggestModel($agentRole),
                    'description' => $this->agentDescription($agentRole),
                    'source_pattern' => $pattern->id,
                ];
            }
        }

        return array_slice($agents, 0, min(count($agents), $teamSize + 2));
    }

    /** @return array<array<string, mixed>> */
    private function recommendSkills(array $workTypes, $baseRecommendation): array
    {
        $skills = [];

        $workTypeSkills = [
            'coding' => ['name' => '/code', 'description' => '코드 구현 스킬'],
            'review' => ['name' => '/review', 'description' => '코드 리뷰 스킬'],
            'testing' => ['name' => '/test', 'description' => '테스트 실행 스킬'],
            'refactoring' => ['name' => '/refactor', 'description' => '리팩토링 스킬'],
            'docs' => ['name' => '/docs', 'description' => '문서화 스킬'],
            'devops' => ['name' => '/deploy', 'description' => '배포 스킬'],
        ];

        foreach ($workTypes as $wt) {
            if (isset($workTypeSkills[$wt])) {
                $skills[] = $workTypeSkills[$wt];
            }
        }

        foreach ($baseRecommendation->skills as $skill) {
            $skills[] = $skill->toArray();
        }

        return $skills;
    }

    /** @return array<array<string, mixed>> */
    private function recommendHooks(array $priorities): array
    {
        $hooks = [];

        if (in_array('human', $priorities) || in_array('lifecycle', $priorities)) {
            $hooks[] = [
                'event' => 'PreToolUse',
                'command' => 'echo "Checking tool safety..."',
                'description' => '위험 명령 사전 검증',
            ];
        }

        if (in_array('verification', $priorities) || in_array('lifecycle', $priorities)) {
            $hooks[] = [
                'event' => 'PostToolUse',
                'command' => 'echo "Running post-tool checks..."',
                'description' => '도구 실행 후 검증',
            ];
        }

        if (in_array('lifecycle', $priorities)) {
            $hooks[] = [
                'event' => 'Notification',
                'command' => 'echo "Task notification"',
                'description' => '작업 알림',
            ];
        }

        return $hooks;
    }

    private function estimateContextBudget(array $agents, array $skills, array $rules): int
    {
        $base = 14200; // system prompt + system tools
        $agentTokens = count($agents) * 400;
        $skillTokens = count($skills) * 300;
        $ruleTokens = count($rules) * 500;

        return $base + $agentTokens + $skillTokens + $ruleTokens;
    }

    private function suggestModel(string $role): string
    {
        return match ($role) {
            'supervisor', 'planner' => 'opus',
            default => 'sonnet',
        };
    }

    private function agentDescription(string $role): string
    {
        return match ($role) {
            'coordinator' => '요청 분석 및 에이전트 라우팅',
            'planner' => '작업 분석 및 계획 수립',
            'generator', 'coder' => '코드 생성 및 구현',
            'reviewer', 'evaluator' => '코드 리뷰 및 품질 평가',
            'tester' => '테스트 작성 및 실행',
            'supervisor' => '작업 감독 및 품질 관리',
            'merger' => '작업 결과 병합 및 검증',
            'be-developer' => '백엔드 개발',
            'fe-developer' => '프론트엔드 개발',
            'infra-engineer' => '인프라 관리',
            'main' => '범용 에이전트',
            default => $role,
        };
    }
}
