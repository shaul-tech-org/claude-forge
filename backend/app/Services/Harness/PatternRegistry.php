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

        // Domain-specific patterns
        $this->register($this->laravelHexagonal());
        $this->register($this->reactNextjs());
        $this->register($this->pythonMl());
        $this->register($this->goMicroservice());
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

    private function laravelHexagonal(): Pattern
    {
        return new Pattern(
            id: 'laravel-hexagonal',
            name: 'Laravel Hexagonal',
            category: 'domain',
            description: 'Laravel + Hexagonal Architecture 패턴. Service/Repository 분리, Eloquent 최적화, Pest 테스트 포함.',
            teamSize: '2-5',
            complexity: 'medium',
            expectedScores: [
                'context' => 85,
                'verification' => 80,
                'state' => 60,
                'tools' => 75,
                'human' => 65,
                'lifecycle' => 70,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'coordinator', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Coordinator', 'description' => 'Laravel 작업 라우팅', 'model' => 'sonnet']],
                    ['id' => 'be-dev', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 200], 'data' => ['label' => 'BE Developer', 'description' => 'PHP/Laravel 구현', 'model' => 'sonnet']],
                    ['id' => 'tester', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 200], 'data' => ['label' => 'Tester', 'description' => 'Pest 테스트 작성', 'model' => 'sonnet']],
                    ['id' => 'laravel-rules', 'type' => 'rule', 'position' => ['x' => 150, 'y' => 370], 'data' => ['label' => 'Laravel Rules', 'description' => 'Eloquent, Migration, Service 패턴']],
                    ['id' => 'php-rules', 'type' => 'rule', 'position' => ['x' => 450, 'y' => 370], 'data' => ['label' => 'PHP Rules', 'description' => 'PSR-12, strict_types, 보안']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'coordinator', 'target' => 'be-dev', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coordinator', 'target' => 'tester', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'be-dev', 'target' => 'laravel-rules', 'type' => 'applies'],
                    ['id' => 'e4', 'source' => 'tester', 'target' => 'php-rules', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['coordinator', 'be-developer', 'tester'],
            recommendedSkills: ['/be', '/test', '/migrate'],
        );
    }

    private function reactNextjs(): Pattern
    {
        return new Pattern(
            id: 'react-nextjs',
            name: 'React + Next.js',
            category: 'domain',
            description: 'React 19 + Next.js 풀스택 패턴. TypeScript strict, Tailwind CSS, Vitest 테스트.',
            teamSize: '2-4',
            complexity: 'medium',
            expectedScores: [
                'context' => 80,
                'verification' => 75,
                'state' => 55,
                'tools' => 80,
                'human' => 60,
                'lifecycle' => 65,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'coordinator', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Coordinator', 'description' => 'React/Next.js 작업 라우팅', 'model' => 'sonnet']],
                    ['id' => 'fe-dev', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 200], 'data' => ['label' => 'FE Developer', 'description' => 'React/TypeScript 구현', 'model' => 'sonnet']],
                    ['id' => 'api-dev', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 200], 'data' => ['label' => 'API Developer', 'description' => 'Next.js API Route 구현', 'model' => 'sonnet']],
                    ['id' => 'ts-rules', 'type' => 'rule', 'position' => ['x' => 150, 'y' => 370], 'data' => ['label' => 'TypeScript Rules', 'description' => 'strict mode, no any']],
                    ['id' => 'react-rules', 'type' => 'rule', 'position' => ['x' => 450, 'y' => 370], 'data' => ['label' => 'React Rules', 'description' => 'Hooks, 컴포넌트 패턴']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'coordinator', 'target' => 'fe-dev', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coordinator', 'target' => 'api-dev', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'fe-dev', 'target' => 'ts-rules', 'type' => 'applies'],
                    ['id' => 'e4', 'source' => 'fe-dev', 'target' => 'react-rules', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['coordinator', 'fe-developer', 'api-developer'],
            recommendedSkills: ['/fe', '/test', '/build'],
        );
    }

    private function pythonMl(): Pattern
    {
        return new Pattern(
            id: 'python-ml',
            name: 'Python ML',
            category: 'domain',
            description: 'Python 머신러닝/데이터 사이언스 패턴. Jupyter, pytest, 데이터 파이프라인.',
            teamSize: '1-3',
            complexity: 'medium',
            expectedScores: [
                'context' => 75,
                'verification' => 70,
                'state' => 70,
                'tools' => 75,
                'human' => 55,
                'lifecycle' => 50,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'data-eng', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 100], 'data' => ['label' => 'Data Engineer', 'description' => '데이터 전처리 및 파이프라인', 'model' => 'sonnet']],
                    ['id' => 'ml-eng', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 100], 'data' => ['label' => 'ML Engineer', 'description' => '모델 학습 및 평가', 'model' => 'sonnet']],
                    ['id' => 'python-rules', 'type' => 'rule', 'position' => ['x' => 300, 'y' => 280], 'data' => ['label' => 'Python Rules', 'description' => 'PEP8, type hints, docstrings']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'data-eng', 'target' => 'ml-eng', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'data-eng', 'target' => 'python-rules', 'type' => 'applies'],
                    ['id' => 'e3', 'source' => 'ml-eng', 'target' => 'python-rules', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['data-engineer', 'ml-engineer'],
            recommendedSkills: ['/train', '/evaluate', '/notebook'],
        );
    }

    private function goMicroservice(): Pattern
    {
        return new Pattern(
            id: 'go-microservice',
            name: 'Go Microservice',
            category: 'domain',
            description: 'Go 마이크로서비스 패턴. gRPC/REST API, Docker, 테스트 커버리지.',
            teamSize: '2-5',
            complexity: 'medium',
            expectedScores: [
                'context' => 80,
                'verification' => 85,
                'state' => 55,
                'tools' => 80,
                'human' => 70,
                'lifecycle' => 75,
            ],
            diagram: [
                'nodes' => [
                    ['id' => 'coordinator', 'type' => 'agent', 'position' => ['x' => 300, 'y' => 50], 'data' => ['label' => 'Coordinator', 'description' => 'Go 서비스 작업 라우팅', 'model' => 'sonnet']],
                    ['id' => 'go-dev', 'type' => 'agent', 'position' => ['x' => 150, 'y' => 200], 'data' => ['label' => 'Go Developer', 'description' => 'Go 서비스 구현', 'model' => 'sonnet']],
                    ['id' => 'infra', 'type' => 'agent', 'position' => ['x' => 450, 'y' => 200], 'data' => ['label' => 'Infra Engineer', 'description' => 'Docker, K8s, CI/CD', 'model' => 'sonnet']],
                    ['id' => 'go-rules', 'type' => 'rule', 'position' => ['x' => 300, 'y' => 370], 'data' => ['label' => 'Go Rules', 'description' => 'Go idioms, error handling, testing']],
                ],
                'edges' => [
                    ['id' => 'e1', 'source' => 'coordinator', 'target' => 'go-dev', 'type' => 'delegation'],
                    ['id' => 'e2', 'source' => 'coordinator', 'target' => 'infra', 'type' => 'delegation'],
                    ['id' => 'e3', 'source' => 'go-dev', 'target' => 'go-rules', 'type' => 'applies'],
                ],
            ],
            recommendedAgents: ['coordinator', 'go-developer', 'infra-engineer'],
            recommendedSkills: ['/build', '/test', '/deploy'],
        );
    }
}
