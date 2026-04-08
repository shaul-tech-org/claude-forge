<?php

declare(strict_types=1);

namespace App\DTOs\Recommendation;

readonly class TechStack
{
    /**
     * @param string[] $implies
     */
    public function __construct(
        public string $id,
        public string $name,
        public string $category,
        public array $implies = [],
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? '',
            name: $data['name'] ?? '',
            category: $data['category'] ?? '',
            implies: $data['implies'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'implies' => $this->implies,
        ];
    }
}
