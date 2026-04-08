<?php

declare(strict_types=1);

namespace App\DTOs\Harness;

readonly class AxisScore
{
    /**
     * @param string[] $suggestions
     * @param array<string, bool> $checklist
     */
    public function __construct(
        public string $axis,
        public int $score,
        public string $grade,
        public array $checklist,
        public array $suggestions,
    ) {}

    public function toArray(): array
    {
        return [
            'axis' => $this->axis,
            'score' => $this->score,
            'grade' => $this->grade,
            'checklist' => $this->checklist,
            'suggestions' => $this->suggestions,
        ];
    }
}
