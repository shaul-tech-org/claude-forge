<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class SkillConfig
{
    public function __construct(
        public string $name,
        public string $description = '',
        public bool $userInvocable = true,
        public string $args = '',
        public string $trigger = '',
        public string $instructions = '',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'] ?? '',
            description: $data['description'] ?? '',
            userInvocable: (bool) ($data['userInvocable'] ?? true),
            args: is_array($data['args'] ?? '') ? implode(', ', $data['args']) : (string) ($data['args'] ?? ''),
            trigger: $data['trigger'] ?? '',
            instructions: $data['instructions'] ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'userInvocable' => $this->userInvocable,
            'args' => $this->args,
            'trigger' => $this->trigger,
            'instructions' => $this->instructions,
        ];
    }
}
