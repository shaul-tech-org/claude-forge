<?php

declare(strict_types=1);

describe('Evaluate API', function (): void {

    it('evaluates a harness via POST', function (): void {
        $response = $this->postJson('/api/v1/harness/evaluate', [
            'agents' => [['label' => 'main', 'description' => 'Main agent']],
            'claudeMd' => '# Project',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['scores', 'overall', 'grade', 'top_priority'],
            ]);

        expect($response->json('data.overall'))->toBeInt();
        expect($response->json('data.grade'))->toBeString();
    });

    it('accepts empty body', function (): void {
        $response = $this->postJson('/api/v1/harness/evaluate', []);

        $response->assertStatus(200);
        expect($response->json('data.overall'))->toBeLessThan(30);
        expect($response->json('data.grade'))->toBe('D');
    });

    it('returns all 6 axes in response', function (): void {
        $response = $this->postJson('/api/v1/harness/evaluate', []);
        $scores = $response->json('data.scores');

        expect($scores)->toHaveKey('context');
        expect($scores)->toHaveKey('verification');
        expect($scores)->toHaveKey('state');
        expect($scores)->toHaveKey('tools');
        expect($scores)->toHaveKey('human');
        expect($scores)->toHaveKey('lifecycle');
    });

    it('returns suggestions array for each axis', function (): void {
        $response = $this->postJson('/api/v1/harness/evaluate', []);
        $scores = $response->json('data.scores');

        foreach ($scores as $axis => $score) {
            expect($score)->toHaveKey('suggestions');
            expect($score['suggestions'])->toBeArray();
        }
    });
});
