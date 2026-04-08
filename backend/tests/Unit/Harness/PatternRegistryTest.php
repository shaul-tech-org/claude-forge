<?php

declare(strict_types=1);

use App\DTOs\Harness\Pattern;
use App\Services\Harness\PatternRegistry;

describe('PatternRegistry', function (): void {
    it('returns all 11 patterns', function (): void {
        $registry = new PatternRegistry();

        expect($registry->all())->toHaveCount(11);
    });

    it('finds pattern by id', function (): void {
        $registry = new PatternRegistry();

        $solo = $registry->find('solo');
        expect($solo)->toBeInstanceOf(Pattern::class);
        expect($solo->id)->toBe('solo');

        $nonexistent = $registry->find('nonexistent');
        expect($nonexistent)->toBeNull();
    });

    it('filters patterns by category', function (): void {
        $registry = new PatternRegistry();

        $starterPatterns = $registry->byCategory('starter');
        expect($starterPatterns)->toHaveCount(1);
        expect($starterPatterns[0]->id)->toBe('solo');
    });

    it('returns all categories', function (): void {
        $registry = new PatternRegistry();

        $categories = $registry->categories();
        expect($categories)->toContain('starter');
        expect($categories)->toContain('workflow');
        expect($categories)->toContain('team');
        expect($categories)->toContain('advanced');
        expect($categories)->toContain('domain');
        expect(count(array_unique($categories)))->toBe(5);
    });

    it('each pattern has complete expected scores', function (): void {
        $registry = new PatternRegistry();
        $axes = ['context', 'verification', 'state', 'tools', 'human', 'lifecycle'];

        foreach ($registry->all() as $pattern) {
            foreach ($axes as $axis) {
                expect($pattern->expectedScores)->toHaveKey($axis);
                expect($pattern->expectedScores[$axis])->toBeInt();
                expect($pattern->expectedScores[$axis])->toBeGreaterThanOrEqual(0);
                expect($pattern->expectedScores[$axis])->toBeLessThanOrEqual(100);
            }
            expect(count($pattern->expectedScores))->toBe(6);
        }
    });

    it('each pattern has valid diagram', function (): void {
        $registry = new PatternRegistry();

        foreach ($registry->all() as $pattern) {
            expect($pattern->diagram)->toHaveKey('nodes');
            expect($pattern->diagram)->toHaveKey('edges');
            expect($pattern->diagram['nodes'])->toBeArray();
            expect($pattern->diagram['edges'])->toBeArray();
            expect($pattern->diagram['nodes'])->not->toBeEmpty();

            foreach ($pattern->diagram['nodes'] as $node) {
                expect($node)->toHaveKey('id');
                expect($node)->toHaveKey('type');
                expect($node)->toHaveKey('position');
                expect($node)->toHaveKey('data');
                expect($node['position'])->toHaveKey('x');
                expect($node['position'])->toHaveKey('y');
            }
        }
    });

    it('solo pattern has correct structure', function (): void {
        $registry = new PatternRegistry();

        $solo = $registry->find('solo');
        expect($solo)->not->toBeNull();
        expect($solo->id)->toBe('solo');
        expect($solo->name)->toBe('Solo');
        expect($solo->category)->toBe('starter');
        expect($solo->complexity)->toBe('low');
        expect($solo->teamSize)->toBe('1');
        expect($solo->description)->toBeString()->not->toBeEmpty();
        expect($solo->recommendedAgents)->toBeArray()->not->toBeEmpty();
        expect($solo->recommendedSkills)->toBeArray()->not->toBeEmpty();
        expect($solo->expectedScores['context'])->toBe(60);
        expect($solo->expectedScores['verification'])->toBe(30);
    });

    it('domain patterns are registered', function (): void {
        $registry = new PatternRegistry();

        $domainIds = ['laravel-hexagonal', 'react-nextjs', 'python-ml', 'go-microservice'];

        foreach ($domainIds as $id) {
            $pattern = $registry->find($id);
            expect($pattern)->not->toBeNull();
            expect($pattern->category)->toBe('domain');
        }

        $domainPatterns = $registry->byCategory('domain');
        expect($domainPatterns)->toHaveCount(4);
    });
});
