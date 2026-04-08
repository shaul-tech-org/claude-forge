<?php

declare(strict_types=1);

namespace App\DTOs\Harness;

readonly class EvaluationResult
{
    /**
     * @param array<string, AxisScore> $scores
     */
    public function __construct(
        public array $scores,
        public int $overall,
        public string $grade,
        public string $topPriority,
    ) {}

    public function toArray(): array
    {
        $scores = [];
        foreach ($this->scores as $axis => $score) {
            $scores[$axis] = $score->toArray();
        }

        return [
            'scores' => $scores,
            'overall' => $this->overall,
            'grade' => $this->grade,
            'top_priority' => $this->topPriority,
        ];
    }
}
