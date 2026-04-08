<?php

declare(strict_types=1);

namespace App\DTOs\Recommendation;

readonly class RecommendationResult
{
    /**
     * @param TechStack[]    $stacks
     * @param RuleTemplate[] $rules
     * @param SkillTemplate[] $skills
     */
    public function __construct(
        public array $stacks = [],
        public array $rules = [],
        public array $skills = [],
    ) {}

    public function toArray(): array
    {
        return [
            'stacks' => array_map(
                static fn(TechStack $s): array => $s->toArray(),
                $this->stacks,
            ),
            'rules' => array_map(
                static fn(RuleTemplate $r): array => $r->toArray(),
                $this->rules,
            ),
            'skills' => array_map(
                static fn(SkillTemplate $s): array => $s->toArray(),
                $this->skills,
            ),
        ];
    }
}
