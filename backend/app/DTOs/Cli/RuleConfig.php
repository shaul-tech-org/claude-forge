<?php

declare(strict_types=1);

namespace App\DTOs\Cli;

readonly class RuleConfig
{
    /**
     * @param string[] $paths
     */
    public function __construct(
        public string $label,
        public string $category = '',
        public array $paths = [],
        public string $content = '',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            label: $data['label'] ?? '',
            category: $data['category'] ?? '',
            paths: $data['paths'] ?? [],
            content: $data['content'] ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'label' => $this->label,
            'category' => $this->category,
            'paths' => $this->paths,
            'content' => $this->content,
        ];
    }
}
