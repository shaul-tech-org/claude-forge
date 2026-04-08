<?php

declare(strict_types=1);

namespace App\DTOs\Recommendation;

readonly class SkillTemplate
{
    public function __construct(
        public string $name,
        public string $description,
        public bool $userInvocable,
        public string $instructions,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            description: $data['description'] ?? '',
            userInvocable: (bool) ($data['userInvocable'] ?? true),
            instructions: $data['instructions'] ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'userInvocable' => $this->userInvocable,
            'instructions' => $this->instructions,
        ];
    }
}
