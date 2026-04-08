<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class AgentConfig
{
    public function __construct(
        public string $name,
        public string $description = '',
        public string $model = 'sonnet',
        public string $instructions = '',
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            description: $data['description'] ?? '',
            model: $data['model'] ?? 'sonnet',
            instructions: $data['instructions'] ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'model' => $this->model,
            'instructions' => $this->instructions,
        ];
    }
}
