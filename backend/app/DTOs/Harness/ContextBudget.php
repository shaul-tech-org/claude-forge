<?php

declare(strict_types=1);

namespace App\DTOs\Harness;

readonly class ContextBudget
{
    /**
     * @param array<string, int> $breakdown
     * @param string[] $warnings
     */
    public function __construct(
        public int $totalCapacity,
        public int $fixedUsage,
        public int $available,
        public float $utilization,
        public array $breakdown,
        public array $warnings,
    ) {}

    public function toArray(): array
    {
        return [
            'total_capacity' => $this->totalCapacity,
            'fixed_usage' => $this->fixedUsage,
            'available' => $this->available,
            'utilization' => round($this->utilization, 4),
            'breakdown' => $this->breakdown,
            'warnings' => $this->warnings,
        ];
    }
}
