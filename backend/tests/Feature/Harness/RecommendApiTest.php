<?php

declare(strict_types=1);

describe('Recommend API', function (): void {

    it('recommends harness configuration', function (): void {
        $response = $this->postJson('/api/v1/harness/recommend', [
            'stacks' => ['react', 'typescript'],
            'teamSize' => 3,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['patterns', 'rules', 'skills', 'stacks'],
            ]);
    });

    it('returns patterns in recommendation', function (): void {
        $response = $this->postJson('/api/v1/harness/recommend', [
            'stacks' => ['laravel'],
            'teamSize' => 2,
            'priorities' => ['verification'],
        ]);

        $patterns = $response->json('data.patterns');
        expect($patterns)->toBeArray();
        expect(count($patterns))->toBeGreaterThan(0);
    });

    it('accepts empty request', function (): void {
        $response = $this->postJson('/api/v1/harness/recommend', []);

        $response->assertStatus(200);
    });
});
