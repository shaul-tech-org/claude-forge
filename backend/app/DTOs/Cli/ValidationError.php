<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class ValidationError
{
    public function __construct(
        public string $field,
        public string $message,
    ) {}

    public function toArray(): array
    {
        return [
            'field' => $this->field,
            'message' => $this->message,
        ];
    }
}
