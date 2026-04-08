<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class ScanResult
{
    /**
     * @param AgentConfig[] $agents
     * @param SkillConfig[] $skills
     * @param RuleConfig[] $rules
     */
    public function __construct(
        public array $agents = [],
        public array $skills = [],
        public array $rules = [],
        public string $projectPath = '',
    ) {
    }

    public function toArray(): array
    {
        return [
            'agents' => array_map(
                static fn (AgentConfig $a): array => $a->toArray(),
                $this->agents,
            ),
            'skills' => array_map(
                static fn (SkillConfig $s): array => $s->toArray(),
                $this->skills,
            ),
            'rules' => array_map(
                static fn (RuleConfig $r): array => $r->toArray(),
                $this->rules,
            ),
            'projectPath' => $this->projectPath,
        ];
    }
}
