<?php

declare(strict_types=1);

describe('GitHub Import API', function (): void {

    it('requires url parameter', function (): void {
        $response = $this->postJson('/api/v1/import/github', []);

        $response->assertStatus(422);
    });

    it('validates url format', function (): void {
        $response = $this->postJson('/api/v1/import/github', [
            'url' => 'not-a-url',
        ]);

        $response->assertStatus(422);
    });
});
