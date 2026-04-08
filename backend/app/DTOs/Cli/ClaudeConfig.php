<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class ClaudeConfig
{
    /**
     * @param AgentConfig[] $agents
     * @param SkillConfig[] $skills
     * @param RuleConfig[]  $rules
     */
    public function __construct(
        public array $agents = [],
        public array $skills = [],
        public array $rules = [],
    ) {}

    public static function fromArray(array $data): self
    {
        $agents = array_map(
            static fn(array $a): AgentConfig => AgentConfig::fromArray($a),
            $data['agents'] ?? [],
        );

        $skills = array_map(
            static fn(array $s): SkillConfig => SkillConfig::fromArray($s),
            $data['skills'] ?? [],
        );

        $rules = array_map(
            static fn(array $r): RuleConfig => RuleConfig::fromArray($r),
            $data['rules'] ?? [],
        );

        return new self(
            agents: $agents,
            skills: $skills,
            rules: $rules,
        );
    }

    public function toArray(): array
    {
        return [
            'agents' => array_map(
                static fn(AgentConfig $a): array => $a->toArray(),
                $this->agents,
            ),
            'skills' => array_map(
                static fn(SkillConfig $s): array => $s->toArray(),
                $this->skills,
            ),
            'rules' => array_map(
                static fn(RuleConfig $r): array => $r->toArray(),
                $this->rules,
            ),
        ];
    }
}
