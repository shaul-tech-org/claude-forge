<?php

declare(strict_types=1);

describe('Context Budget API', function (): void {

    it('calculates budget via POST', function (): void {
        $response = $this->postJson('/api/v1/harness/context-budget', [
            'agents' => [['instructions' => 'Some instructions']],
            'claudeMd' => '# Project context',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['total_capacity', 'fixed_usage', 'available', 'utilization', 'breakdown', 'warnings'],
            ]);
    });

    it('returns correct structure', function (): void {
        $response = $this->postJson('/api/v1/harness/context-budget', []);
        $data = $response->json('data');

        expect($data['total_capacity'])->toBe(256000);
        expect($data['fixed_usage'])->toBeInt();
        expect($data['available'])->toBeInt();
        expect($data['utilization'])->toBeFloat();
        expect($data['breakdown'])->toBeArray();
        expect($data['warnings'])->toBeArray();
    });
});
