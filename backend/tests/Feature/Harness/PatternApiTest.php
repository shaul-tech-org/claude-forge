<?php

declare(strict_types=1);

describe('Pattern API', function (): void {

    it('lists all patterns', function (): void {
        $response = $this->getJson('/api/v1/patterns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'category', 'description', 'team_size', 'complexity', 'expected_scores']],
                'categories',
            ]);

        $data = $response->json('data');
        expect(count($data))->toBe(11);
    });

    it('returns pattern detail by id', function (): void {
        $response = $this->getJson('/api/v1/patterns/solo');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'category', 'description',
                    'diagram' => ['nodes', 'edges'],
                    'recommended_agents',
                    'recommended_skills',
                    'expected_scores',
                ],
            ]);

        expect($response->json('data.id'))->toBe('solo');
        expect($response->json('data.diagram.nodes'))->toBeArray();
    });

    it('returns 404 for unknown pattern', function (): void {
        $response = $this->getJson('/api/v1/patterns/nonexistent');

        $response->assertStatus(404);
    });

    it('pattern list items have expected fields', function (): void {
        $response = $this->getJson('/api/v1/patterns');
        $first = $response->json('data.0');

        expect($first)->toHaveKey('id');
        expect($first)->toHaveKey('name');
        expect($first)->toHaveKey('category');
        expect($first)->toHaveKey('description');
        expect($first)->toHaveKey('expected_scores');
        // Summary should NOT include diagram
        expect($first)->not->toHaveKey('diagram');
    });
});
