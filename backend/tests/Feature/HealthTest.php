<?php

it('returns health status', function (): void {
    $response = $this->getJson('/api/health');

    $response->assertStatus(200)
        ->assertJsonStructure(['status', 'timestamp'])
        ->assertJson(['status' => 'ok']);
});
