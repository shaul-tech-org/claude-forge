<?php

declare(strict_types=1);

it('returns health status', function (): void {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200)
        ->assertJsonStructure(['status', 'timestamp'])
        ->assertJson(['status' => 'ok']);
});
