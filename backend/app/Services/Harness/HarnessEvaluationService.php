<?php

declare(strict_types=1);

namespace App\Services\Harness;

use App\DTOs\Harness\AxisScore;
use App\DTOs\Harness\EvaluationResult;

final class HarnessEvaluationService
{
    private const array AXIS_WEIGHTS = [
        'context' => 1.0,
        'verification' => 1.0,
        'state' => 0.8,
        'tools' => 0.9,
        'human' => 0.7,
        'lifecycle' => 0.6,
    ];

    /**
     * @param array{
     *   agents?: array<array<string, mixed>>,
     *   skills?: array<array<string, mixed>>,
     *   rules?: array<array<string, mixed>>,
     *   hooks?: array<string, mixed>,
     *   settings?: array<string, mixed>,
     *   claudeMd?: string,
     * } $harness
     */
    public function evaluate(array $harness): EvaluationResult
    {
        $scores = [
            'context' => $this->evaluateContext($harness),
            'verification' => $this->evaluateVerification($harness),
            'state' => $this->evaluateState($harness),
            'tools' => $this->evaluateTools($harness),
            'human' => $this->evaluateHuman($harness),
            'lifecycle' => $this->evaluateLifecycle($harness),
        ];

        $overall = $this->calculateOverall($scores);
        $grade = $this->gradeFromScore($overall);
        $topPriority = $this->findTopPriority($scores);

        return new EvaluationResult(
            scores: $scores,
            overall: $overall,
            grade: $grade,
            topPriority: $topPriority,
        );
    }

    private function evaluateContext(array $harness): AxisScore
    {
        $checklist = [
            'has_claude_md' => ! empty($harness['claudeMd']),
            'claude_md_has_project_definition' => $this->hasSection($harness['claudeMd'] ?? '', ['프로젝트', 'project', '제품', 'product']),
            'claude_md_has_tech_stack' => $this->hasSection($harness['claudeMd'] ?? '', ['기술', 'tech', 'stack']),
            'has_rules' => ! empty($harness['rules']),
            'rules_have_paths' => $this->rulesHavePaths($harness['rules'] ?? []),
            'has_agents' => ! empty($harness['agents']),
            'agents_have_descriptions' => $this->agentsHaveDescriptions($harness['agents'] ?? []),
            'agents_have_instructions' => $this->agentsHaveInstructions($harness['agents'] ?? []),
            'no_duplicate_rules' => ! $this->hasDuplicateLabels($harness['rules'] ?? []),
            'claude_md_under_5k' => strlen($harness['claudeMd'] ?? '') < 20000,
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = $this->contextSuggestions($checklist);

        return new AxisScore('context', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function evaluateVerification(array $harness): AxisScore
    {
        $agents = $harness['agents'] ?? [];
        $skills = $harness['skills'] ?? [];
        $rules = $harness['rules'] ?? [];

        $checklist = [
            'has_test_skill' => $this->hasLabelContaining($skills, ['test', '테스트']),
            'has_review_agent' => $this->hasLabelContaining($agents, ['review', 'evaluator', '리뷰', '평가']),
            'has_lint_rule' => $this->hasLabelContaining($rules, ['lint', 'style', 'format', 'pint', 'eslint']),
            'has_type_check' => $this->hasLabelContaining($rules, ['type', 'typescript', 'strict']),
            'has_security_rule' => $this->hasLabelContaining($rules, ['security', 'owasp', '보안', 'xss', 'injection']),
            'multiple_verification_layers' => count(array_filter([$this->hasLabelContaining($skills, ['test']), $this->hasLabelContaining($agents, ['review']), $this->hasLabelContaining($rules, ['lint'])])) >= 2,
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = $this->verificationSuggestions($checklist);

        return new AxisScore('verification', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function evaluateState(array $harness): AxisScore
    {
        $settings = $harness['settings'] ?? [];

        $checklist = [
            'has_memory_enabled' => ! empty($settings['memory']) || ! empty($settings['auto_memory']),
            'claude_md_has_state_section' => $this->hasSection($harness['claudeMd'] ?? '', ['상태', 'state', 'memory', '메모리']),
            'has_agent_memory' => $this->hasLabelContaining($harness['agents'] ?? [], ['memory', 'state', '기억']),
            'has_update_rules' => $this->hasSection($harness['claudeMd'] ?? '', ['업데이트', 'update', '갱신']),
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = [];
        if (! $checklist['has_memory_enabled']) {
            $suggestions[] = 'auto-memory를 활성화하여 세션 간 학습을 지원하세요.';
        }
        if (! $checklist['claude_md_has_state_section']) {
            $suggestions[] = 'CLAUDE.md에 상태 관리 섹션을 추가하세요.';
        }

        return new AxisScore('state', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function evaluateTools(array $harness): AxisScore
    {
        $agents = $harness['agents'] ?? [];
        $skills = $harness['skills'] ?? [];

        $checklist = [
            'has_skills' => ! empty($skills),
            'skills_are_user_invocable' => $this->hasUserInvocableSkills($skills),
            'has_multiple_agents' => count($agents) >= 2,
            'has_coordinator' => $this->hasLabelContaining($agents, ['coordinator', '코디네이터', 'router']),
            'has_specialized_agents' => count($agents) >= 3,
            'no_duplicate_skills' => ! $this->hasDuplicateLabels($skills),
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = [];
        if (! $checklist['has_coordinator'] && count($agents) >= 3) {
            $suggestions[] = '에이전트가 3개 이상이면 Coordinator 에이전트로 라우팅을 관리하세요.';
        }
        if (! $checklist['skills_are_user_invocable']) {
            $suggestions[] = '사용자가 직접 호출 가능한 스킬(user_invocable)을 추가하세요.';
        }

        return new AxisScore('tools', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function evaluateHuman(array $harness): AxisScore
    {
        $settings = $harness['settings'] ?? [];
        $rules = $harness['rules'] ?? [];

        $checklist = [
            'has_permission_settings' => ! empty($settings['permissions']),
            'has_dangerous_command_protection' => $this->hasLabelContaining($rules, ['dangerous', '위험', 'prohibited', '금지']),
            'has_approval_gates' => ! empty($settings['approval_gates']) || $this->hasSection($harness['claudeMd'] ?? '', ['승인', 'approval', 'confirm']),
            'not_fully_autonomous' => ($settings['permission_mode'] ?? 'ask') !== 'full_auto',
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = [];
        if (! $checklist['has_permission_settings']) {
            $suggestions[] = 'settings.json에 권한 설정을 추가하여 위험 명령을 관리하세요.';
        }
        if (! $checklist['has_dangerous_command_protection']) {
            $suggestions[] = '위험 명령(rm -rf, force push 등) 차단 규칙을 추가하세요.';
        }

        return new AxisScore('human', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function evaluateLifecycle(array $harness): AxisScore
    {
        $hooks = $harness['hooks'] ?? [];

        $checklist = [
            'has_hooks' => ! empty($hooks),
            'has_pre_tool_hook' => ! empty($hooks['PreToolUse']) || ! empty($hooks['pre_tool_use']),
            'has_post_tool_hook' => ! empty($hooks['PostToolUse']) || ! empty($hooks['post_tool_use']),
            'has_notification_hook' => ! empty($hooks['Notification']) || ! empty($hooks['notification']),
            'has_format_hook' => $this->hasHookContaining($hooks, ['format', 'lint', 'pint', 'prettier']),
        ];

        $score = $this->scoreFromChecklist($checklist);
        $suggestions = [];
        if (! $checklist['has_hooks']) {
            $suggestions[] = 'Hooks를 설정하여 이벤트 기반 자동화를 도입하세요.';
        }
        if (! $checklist['has_pre_tool_hook']) {
            $suggestions[] = 'PreToolUse 훅으로 위험 명령을 사전 차단하세요.';
        }
        if (! $checklist['has_format_hook']) {
            $suggestions[] = '코드 포맷터(Pint, Prettier 등)를 PostToolUse 훅에 연결하세요.';
        }

        return new AxisScore('lifecycle', $score, $this->gradeFromScore($score), $checklist, $suggestions);
    }

    private function scoreFromChecklist(array $checklist): int
    {
        $total = count($checklist);
        if ($total === 0) {
            return 0;
        }

        $passed = count(array_filter($checklist));

        return (int) round(($passed / $total) * 100);
    }

    /** @param array<string, AxisScore> $scores */
    private function calculateOverall(array $scores): int
    {
        $weightedSum = 0.0;
        $totalWeight = 0.0;

        foreach ($scores as $axis => $score) {
            $weight = self::AXIS_WEIGHTS[$axis] ?? 1.0;
            $weightedSum += $score->score * $weight;
            $totalWeight += $weight;
        }

        return (int) round($weightedSum / $totalWeight);
    }

    private function gradeFromScore(int $score): string
    {
        return match (true) {
            $score >= 90 => 'S',
            $score >= 75 => 'A',
            $score >= 60 => 'B',
            $score >= 40 => 'C',
            default => 'D',
        };
    }

    /** @param array<string, AxisScore> $scores */
    private function findTopPriority(array $scores): string
    {
        $lowest = null;
        $lowestAxis = 'context';

        foreach ($scores as $axis => $score) {
            $weight = self::AXIS_WEIGHTS[$axis] ?? 1.0;
            $weighted = $score->score * $weight;
            if ($lowest === null || $weighted < $lowest) {
                $lowest = $weighted;
                $lowestAxis = $axis;
            }
        }

        return $lowestAxis;
    }

    private function hasSection(string $content, array $keywords): bool
    {
        $lower = mb_strtolower($content);
        foreach ($keywords as $keyword) {
            if (str_contains($lower, mb_strtolower($keyword))) {
                return true;
            }
        }

        return false;
    }

    private function hasLabelContaining(array $items, array $keywords): bool
    {
        foreach ($items as $item) {
            $label = mb_strtolower($item['label'] ?? $item['name'] ?? '');
            $desc = mb_strtolower($item['description'] ?? '');
            foreach ($keywords as $keyword) {
                $kw = mb_strtolower($keyword);
                if (str_contains($label, $kw) || str_contains($desc, $kw)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function hasDuplicateLabels(array $items): bool
    {
        $labels = array_map(static fn (array $item): string => $item['label'] ?? '', $items);

        return count($labels) !== count(array_unique($labels));
    }

    private function rulesHavePaths(array $rules): bool
    {
        foreach ($rules as $rule) {
            if (! empty($rule['paths'])) {
                return true;
            }
        }

        return false;
    }

    private function agentsHaveDescriptions(array $agents): bool
    {
        foreach ($agents as $agent) {
            if (empty($agent['description'])) {
                return false;
            }
        }

        return ! empty($agents);
    }

    private function agentsHaveInstructions(array $agents): bool
    {
        foreach ($agents as $agent) {
            if (! empty($agent['instructions'])) {
                return true;
            }
        }

        return false;
    }

    private function hasUserInvocableSkills(array $skills): bool
    {
        foreach ($skills as $skill) {
            if (! empty($skill['userInvocable']) || ! empty($skill['user_invocable'])) {
                return true;
            }
        }

        return false;
    }

    private function hasHookContaining(array $hooks, array $keywords): bool
    {
        $json = mb_strtolower(json_encode($hooks) ?: '');
        foreach ($keywords as $keyword) {
            if (str_contains($json, mb_strtolower($keyword))) {
                return true;
            }
        }

        return false;
    }

    private function contextSuggestions(array $checklist): array
    {
        $suggestions = [];
        if (! $checklist['has_claude_md']) {
            $suggestions[] = 'CLAUDE.md 파일을 생성하여 프로젝트 컨텍스트를 정의하세요.';
        }
        if (! $checklist['claude_md_has_project_definition']) {
            $suggestions[] = 'CLAUDE.md에 프로젝트 정의 섹션을 추가하세요.';
        }
        if (! $checklist['has_rules']) {
            $suggestions[] = '코딩 규칙을 추가하여 일관된 코드 품질을 유지하세요.';
        }
        if (! $checklist['agents_have_instructions']) {
            $suggestions[] = '에이전트에 상세 instructions를 추가하여 행동을 구체화하세요.';
        }

        return $suggestions;
    }

    private function verificationSuggestions(array $checklist): array
    {
        $suggestions = [];
        if (! $checklist['has_test_skill']) {
            $suggestions[] = '테스트 실행 스킬(/test)을 추가하여 자동 검증을 도입하세요.';
        }
        if (! $checklist['has_review_agent']) {
            $suggestions[] = '리뷰 에이전트를 추가하여 코드 품질을 자동 검증하세요.';
        }
        if (! $checklist['has_security_rule']) {
            $suggestions[] = '보안 규칙(OWASP Top 10)을 추가하세요.';
        }

        return $suggestions;
    }
}
