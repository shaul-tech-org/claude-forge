<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class ApplyResult
{
    /**
     * @param string[] $created
     * @param string[] $updated
     * @param string[] $skipped
     */
    public function __construct(
        public array $created = [],
        public array $updated = [],
        public array $skipped = [],
    ) {}

    public function toArray(): array
    {
        return [
            'created' => $this->created,
            'updated' => $this->updated,
            'skipped' => $this->skipped,
        ];
    }
}
