<?php

declare(strict_types=1);

namespace App\DTOs\Harness;

readonly class Pattern
{
    /**
     * @param array<string, int> $expectedScores
     * @param array<string, mixed> $diagram
     * @param string[] $recommendedAgents
     * @param string[] $recommendedSkills
     */
    public function __construct(
        public string $id,
        public string $name,
        public string $category,
        public string $description,
        public string $teamSize,
        public string $complexity,
        public array $expectedScores,
        public array $diagram,
        public array $recommendedAgents = [],
        public array $recommendedSkills = [],
    ) {}

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'team_size' => $this->teamSize,
            'complexity' => $this->complexity,
            'expected_scores' => $this->expectedScores,
            'diagram' => $this->diagram,
            'recommended_agents' => $this->recommendedAgents,
            'recommended_skills' => $this->recommendedSkills,
        ];
    }

    public function toSummary(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'description' => $this->description,
            'team_size' => $this->teamSize,
            'complexity' => $this->complexity,
            'expected_scores' => $this->expectedScores,
        ];
    }
}
