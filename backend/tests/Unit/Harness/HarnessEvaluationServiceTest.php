<?php

declare(strict_types=1);

use App\DTOs\Harness\AxisScore;
use App\Services\Harness\HarnessEvaluationService;

describe('HarnessEvaluationService', function (): void {

    it('evaluates empty harness with low scores', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([]);

        expect($result->overall)->toBeLessThan(30);
        expect($result->grade)->toBe('D');
    });

    it('evaluates well-configured harness with high scores', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([
            'agents' => [
                ['label' => 'coordinator', 'description' => 'Route requests', 'instructions' => 'Analyze and route.'],
                ['label' => 'reviewer', 'description' => 'Code review and evaluation'],
            ],
            'skills' => [
                ['label' => 'test runner', 'description' => 'Run tests', 'userInvocable' => true],
            ],
            'rules' => [
                ['label' => 'security rules', 'description' => 'OWASP', 'paths' => ['**/*.php'], 'content' => 'No SQL injection'],
                ['label' => 'lint rules', 'description' => 'Code style formatting'],
                ['label' => 'typescript strict', 'description' => 'TypeScript strict mode'],
            ],
            'hooks' => [
                'PreToolUse' => [['command' => 'check']],
                'PostToolUse' => [['command' => 'format']],
                'Notification' => [['command' => 'notify']],
            ],
            'settings' => ['permissions' => ['allow' => []], 'permission_mode' => 'ask'],
            'claudeMd' => "# My Project\n\n## 프로젝트 정의\nGreat product.\n\n## 기술 스택\nPHP, Laravel.",
        ]);

        expect($result->overall)->toBeGreaterThanOrEqual(60);
        expect(in_array($result->grade, ['S', 'A', 'B']))->toBeTrue();
    });

    it('returns all 6 axis scores', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([]);
        $axes = ['context', 'verification', 'state', 'tools', 'human', 'lifecycle'];
        foreach ($axes as $axis) {
            expect($result->scores)->toHaveKey($axis);
        }
        expect(count($result->scores))->toBe(6);
    });

    it('each axis score has correct structure', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([]);
        foreach ($result->scores as $axis => $score) {
            expect($score)->toBeInstanceOf(AxisScore::class);
            expect($score->axis)->toBe($axis);
            expect($score->score)->toBeGreaterThanOrEqual(0);
            expect($score->score)->toBeLessThanOrEqual(100);
            expect($score->checklist)->toBeArray();
            expect($score->suggestions)->toBeArray();
        }
    });

    it('context axis checks CLAUDE.md presence', function (): void {
        $service = new HarnessEvaluationService();
        $with = $service->evaluate(['claudeMd' => '# My Project']);
        expect($with->scores['context']->checklist['has_claude_md'])->toBeTrue();
        $without = $service->evaluate([]);
        expect($without->scores['context']->checklist['has_claude_md'])->toBeFalse();
    });

    it('verification axis checks test skill presence', function (): void {
        $service = new HarnessEvaluationService();
        $with = $service->evaluate(['skills' => [['label' => 'test runner', 'description' => 'tests']]]);
        expect($with->scores['verification']->checklist['has_test_skill'])->toBeTrue();
    });

    it('provides suggestions for empty harness', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([]);
        $all = [];
        foreach ($result->scores as $score) {
            $all = array_merge($all, $score->suggestions);
        }
        expect($all)->not->toBeEmpty();
    });

    it('identifies top priority axis', function (): void {
        $service = new HarnessEvaluationService();
        $result = $service->evaluate([]);
        expect(in_array($result->topPriority, ['context', 'verification', 'state', 'tools', 'human', 'lifecycle']))->toBeTrue();
    });
});
