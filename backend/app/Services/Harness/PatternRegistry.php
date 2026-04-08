<?php

declare(strict_types=1);

namespace App\Services\Harness;

use App\DTOs\Harness\Pattern;

final class PatternRegistry
{
    /** @var array<string, Pattern> */
    private array $patterns = [];

    public function __construct()
    {
        $this->registerAll();
    }

    /** @return Pattern[] */
    public function all(): array
    {
        return array_values($this->patterns);
    }

    public function find(string $id): ?Pattern
    {
        return $this->patterns[$id] ?? null;
    }

    /** @return Pattern[] */
    public function byCategory(string $category): array
    {
        return array_values(
            array_filter($this->patterns, static fn (Pattern $p): bool => $p->category === $category)
        );
    }

    /** @return string[] */
    public function categories(): array
    {
        return array_unique(array_map(static fn (Pattern $p): string => $p->category, $this->patterns));
    }

    private function registerAll(): void
    {
        $this->register($this->solo());
        $this->register($this->pipeline());
        $this->register($this->fanOutFanIn());
        $this->register($this->expertPool());
        $this->register($this->producerReviewer());
        $this->register($this->supervisor());
        $this->register($this->threeAgent());
    }

    private function register(Pattern $pattern): void
    {
        $this->patterns[$pattern->id] = $pattern;
    }

    private function solo(): Pattern
    {
        return new Pattern(
            id: 'solo',
            name: 'Solo',
            category: 'starter',
            description: '에이전트 1개로 모든 작업을 처리. 스킬로 기능을 확장하고 규칙으로 품질을 관리.',
            teamSize: '1',
            complexity: 'low',
            expectedScores: [
                'context' => 60,
                'verification' => 30,
                'state' => 40,
                'tools' => 50,
                'human' => 70,
                'lifecycle' => 20,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'main', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 100], 'data' => ['label' => 'Main Agent', 'description' => '모든 작업을 처리하는 단일 에이전트', 'model' => 'sonnet']],
                    ['id' => 'skill-1', 'type' => 'skill', 'position' => ['x' => 100, 'y' => 280], 'data' => ['label' => 'Domain Skill', 'description' => '도메인 특화 스킬']],
                    ['id' => 'skill-2', 'type' => 'skill', 'position' => ['x' => 500, 'y' => 280], 'data' => ['label' => 'Test Skill', 'description' => '테스트 실행 스킬']],
                    ['id' => 'rule-1', 'type' => 'rule', 'position' => ['x' => 300, 'y' => 280], 'data' => ['label' => 'Coding Rules', 'description' => '코딩 표준 규칙']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'main', 'target' => 'skill-1', 'type' => 'uses'],
                    ['id' => 'e2', 'source' => 'main', 'target' => 'skill-2', 'type' => 'uses'],
                    ['id' => 'e3', 'source' => 'main', 'target' => 'rule-1', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['main'],
            recommendedSkills: ['/test', '/review'],
        );
    }

    private function pipeline(): Pattern
    {
        return new Pattern(
            id: 'pipeline',
            name: 'Pipeline',
            category: 'workflow',
            description: '순차 처리 체인. 각 단계의 에이전트가 결과를 다음 단계에 전달. CI/CD, 데이터 처리에 적합.',
            teamSize: '1-3',
            complexity: 'medium',
            expectedScores: [
                'context' => 70,
                'verification' => 75,
                'state' => 60,
                'tools' => 70,
                'human' => 50,
                'lifecycle' => 65,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'planner', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Planner', 'description' => '작업 분석 및 계획 수립', 'model' => 'sonnet']],
                    ['id' => 'coder', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 200], 'data' => ['label' => 'Coder', 'description' => '코드 구현', 'model' => 'sonnet']],
                    ['id' => 'tester', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 350], 'data' => ['label' => 'Tester', 'description' => '테스트 작성 및 실행', 'model' => 'sonnet']],
                    ['id' => 'reviewer', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 500], 'data' => ['label' => 'Reviewer', 'description' => '코드 리뷰 및 최종 검증', 'model' => 'sonnet']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'planner', 'target' => 'coder', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coder', 'target' => 'tester', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'tester', 'target' => 'reviewer', 'type' => 'delegation'],
                ],
            ],
            recommendedAgents: ['planner', 'coder', 'tester', 'reviewer'],
            recommendedSkills: ['/plan', '/test', '/review', '/deploy'],
        );
    }

    private function fanOutFanIn(): Pattern
    {
        return new Pattern(
            id: 'fan-out-fan-in',
            name: 'Fan-out / Fan-in',
            category: 'team',
            description: '코디네이터가 작업을 병렬 분배하고 결과를 병합. 대규모 리팩토링, 마이그레이션에 적합.',
            teamSize: '3-8',
            complexity: 'high',
            expectedScores: [
                'context' => 80,
                'verification' => 70,
                'state' => 75,
                'tools' => 85,
                'human' => 60,
                'lifecycle' => 70,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'coordinator', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Coordinator', 'description' => '작업 분배 및 결과 병합', 'model' => 'sonnet']],
                    ['id' => 'worker-be', 'type' => 'agent', 'position' => ['x' => 100, 'y' => 220], 'data' => ['label' => 'BE Worker', 'description' => '백엔드 작업', 'model' => 'sonnet']],
                    ['id' => 'worker-fe', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 220], 'data' => ['label' => 'FE Worker', 'description' => '프론트엔드 작업', 'model' => 'sonnet']],
                    ['id' => 'worker-infra', 'type' => 'agent', 'position' => ['x' => 500, 'y' => 220], 'data' => ['label' => 'Infra Worker', 'description' => '인프라 작업', 'model' => 'sonnet']],
                    ['id' => 'merger', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 400], 'data' => ['label' => 'Merger', 'description' => '결과 병합 및 검증', 'model' => 'sonnet']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'coordinator', 'target' => 'worker-be', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coordinator', 'target' => 'worker-fe', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'coordinator', 'target' => 'worker-infra', 'type' => 'delegation'],
                    ['id' => 'e4', 'source' => 'worker-be', 'target' => 'merger', 'type' => 'delegation'],
                    ['id' => 'e5', 'source' => 'worker-fe', 'target' => 'merger', 'type' => 'delegation'],
                    ['id' => 'e6', 'source' => 'worker-infra', 'target' => 'merger', 'type' => 'delegation'],
                ],
            ],
            recommendedAgents: ['coordinator', 'be-developer', 'fe-developer', 'infra-engineer', 'merger'],
            recommendedSkills: ['/be', '/fe', '/infra', '/fullstack'],
        );
    }

    private function expertPool(): Pattern
    {
        return new Pattern(
            id: 'expert-pool',
            name: 'Expert Pool',
            category: 'team',
            description: '코디네이터가 요청을 분석하여 전문가 에이전트에 자동 위임. 풀스택 개발에 적합.',
            teamSize: '2-6',
            complexity: 'medium',
            expectedScores: [
                'context' => 75,
                'verification' => 60,
                'state' => 70,
                'tools' => 80,
                'human' => 65,
                'lifecycle' => 50,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'coordinator', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Coordinator', 'description' => '요청 분석 및 전문가 라우팅', 'model' => 'sonnet']],
                    ['id' => 'be-expert', 'type' => 'agent', 'position' => ['x' => 100, 'y' => 220], 'data' => ['label' => 'BE Expert', 'description' => '백엔드 전문가', 'model' => 'sonnet']],
                    ['id' => 'fe-expert', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 220], 'data' => ['label' => 'FE Expert', 'description' => '프론트엔드 전문가', 'model' => 'sonnet']],
                    ['id' => 'db-expert', 'type' => 'agent', 'position' => ['x' => 500, 'y' => 220], 'data' => ['label' => 'DB Expert', 'description' => '데이터베이스 전문가', 'model' => 'sonnet']],
                    ['id' => 'rule-be', 'type' => 'rule', 'position' => ['x' => 100, 'y' => 400], 'data' => ['label' => 'BE Rules', 'description' => '백엔드 코딩 규칙']],
                    ['id' => 'rule-fe', 'type' => 'rule', 'position' => ['x' => 300, 'y' => 400], 'data' => ['label' => 'FE Rules', 'description' => '프론트엔드 코딩 규칙']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'coordinator', 'target' => 'be-expert', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coordinator', 'target' => 'fe-expert', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'coordinator', 'target' => 'db-expert', 'type' => 'delegation'],
                    ['id' => 'e4', 'source' => 'be-expert', 'target' => 'rule-be', 'type' => 'applies'],
                    ['id' => 'e5', 'source' => 'fe-expert', 'target' => 'rule-fe', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['coordinator', 'be-developer', 'fe-developer', 'db-admin'],
            recommendedSkills: ['/be', '/fe', '/db', '/fullstack'],
        );
    }

    private function producerReviewer(): Pattern
    {
        return new Pattern(
            id: 'producer-reviewer',
            name: 'Producer-Reviewer',
            category: 'workflow',
            description: '생성 에이전트와 리뷰 에이전트가 반복 루프. 품질 중시 프로젝트에 적합.',
            teamSize: '1-3',
            complexity: 'medium',
            expectedScores: [
                'context' => 70,
                'verification' => 90,
                'state' => 65,
                'tools' => 60,
                'human' => 55,
                'lifecycle' => 60,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'generator', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 150], 'data' => ['label' => 'Generator', 'description' => '코드 생성', 'model' => 'sonnet']],
                    ['id' => 'reviewer', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 150], 'data' => ['label' => 'Reviewer', 'description' => '코드 리뷰 및 피드백', 'model' => 'sonnet']],
                    ['id' => 'test-skill', 'type' => 'skill', 'position' => ['x' => 150, 'y' => 330], 'data' => ['label' => 'Test Runner', 'description' => '자동 테스트 실행']],
                    ['id' => 'lint-rule', 'type' => 'rule', 'position' => ['x' => 450, 'y' => 330], 'data' => ['label' => 'Quality Rules', 'description' => '코드 품질 규칙']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'generator', 'target' => 'reviewer', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'reviewer', 'target' => 'generator', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'generator', 'target' => 'test-skill', 'type' => 'uses'],
                    ['id' => 'e4', 'source' => 'reviewer', 'target' => 'lint-rule', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['generator', 'reviewer'],
            recommendedSkills: ['/test', '/review', '/lint'],
        );
    }

    private function supervisor(): Pattern
    {
        return new Pattern(
            id: 'supervisor',
            name: 'Supervisor',
            category: 'advanced',
            description: '감독자가 작업자의 품질을 관리하고 평가. 주니어 팀 지원, 교육에 적합.',
            teamSize: '3-10',
            complexity: 'high',
            expectedScores: [
                'context' => 85,
                'verification' => 85,
                'state' => 80,
                'tools' => 75,
                'human' => 75,
                'lifecycle' => 70,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'supervisor', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Supervisor', 'description' => '품질 관리 및 작업 감독', 'model' => 'opus']],
                    ['id' => 'worker-1', 'type' => 'agent', 'position' => ['x' => 100, 'y' => 220], 'data' => ['label' => 'Worker 1', 'description' => '실행 에이전트', 'model' => 'sonnet']],
                    ['id' => 'worker-2', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 220], 'data' => ['label' => 'Worker 2', 'description' => '실행 에이전트', 'model' => 'sonnet']],
                    ['id' => 'evaluator', 'type' => 'agent', 'position' => ['x' => 500, 'y' => 220], 'data' => ['label' => 'Evaluator', 'description' => '결과 평가', 'model' => 'sonnet']],
                    ['id' => 'quality-rules', 'type' => 'rule', 'position' => ['x' => 300, 'y' => 400], 'data' => ['label' => 'Quality Standards', 'description' => '품질 기준 규칙']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'supervisor', 'target' => 'worker-1', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'supervisor', 'target' => 'worker-2', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'supervisor', 'target' => 'evaluator', 'type' => 'delegation'],
                    ['id' => 'e4', 'source' => 'evaluator', 'target' => 'quality-rules', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['supervisor', 'worker', 'evaluator'],
            recommendedSkills: ['/review', '/test', '/evaluate'],
        );
    }

    private function threeAgent(): Pattern
    {
        return new Pattern(
            id: 'three-agent',
            name: '3-Agent (Anthropic)',
            category: 'advanced',
            description: 'Planner-Generator-Evaluator 구조. GAN 패턴처럼 생성자와 평가자가 경쟁적으로 품질 향상.',
            teamSize: '1-3',
            complexity: 'high',
            expectedScores: [
                'context' => 85,
                'verification' => 95,
                'state' => 75,
                'tools' => 70,
                'human' => 60,
                'lifecycle' => 65,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'planner', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Planner', 'description' => '작업 계획 수립', 'model' => 'opus']],
                    ['id' => 'generator', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 230], 'data' => ['label' => 'Generator', 'description' => '코드 생성', 'model' => 'sonnet']],
                    ['id' => 'evaluator', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 230], 'data' => ['label' => 'Evaluator', 'description' => '결과 평가 및 피드백', 'model' => 'sonnet']],
                    ['id' => 'test-skill', 'type' => 'skill', 'position' => ['x' => 150, 'y' => 410], 'data' => ['label' => 'Auto Test', 'description' => '자동 테스트 실행']],
                    ['id' => 'eval-rule', 'type' => 'rule', 'position' => ['x' => 450, 'y' => 410], 'data' => ['label' => 'Eval Criteria', 'description' => '평가 기준']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'planner', 'target' => 'generator', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'generator', 'target' => 'evaluator', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'evaluator', 'target' => 'generator', 'type' => 'delegation'],
                    ['id' => 'e4', 'source' => 'generator', 'target' => 'test-skill', 'type' => 'uses'],
                    ['id' => 'e5', 'source' => 'evaluator', 'target' => 'eval-rule', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['planner', 'generator', 'evaluator'],
            recommendedSkills: ['/plan', '/test', '/evaluate'],
        );
    }
}
