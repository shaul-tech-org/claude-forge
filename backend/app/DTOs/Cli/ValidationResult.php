<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class ValidationResult
{
    /**
     * @param ValidationError[] $errors
     */
    public function __construct(
        public bool $valid,
        public array $errors = [],
    ) {
    }

    public function toArray(): array
    {
        return [
            'valid' => $this->valid,
            'errors' => array_map(
                static fn (ValidationError $e): array => $e->toArray(),
                $this->errors,
            ),
        ];
    }
}
