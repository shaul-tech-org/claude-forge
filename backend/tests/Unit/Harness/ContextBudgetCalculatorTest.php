<?php

declare(strict_types=1);

use App\Services\Harness\ContextBudgetCalculator;

describe('ContextBudgetCalculator', function (): void {

    it('calculates budget for empty config', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate([]);

        expect($result->breakdown)->toHaveKey('system_prompt');
        expect($result->breakdown)->toHaveKey('system_tools');
        expect($result->breakdown['system_prompt'])->toBe(3200);
        expect($result->breakdown['system_tools'])->toBe(11000);
    });

    it('includes CLAUDE.md token estimation', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate(['claudeMd' => str_repeat('Hello World. ', 100)]);

        expect($result->breakdown['claude_md'])->toBeGreaterThan(0);
    });

    it('estimates agent tokens correctly', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate([
            'agents' => [
                ['instructions' => ''],
                ['instructions' => ''],
                ['instructions' => ''],
            ],
        ]);

        expect($result->breakdown['agents'])->toBe(1200); // 3 * 400
    });

    it('calculates utilization correctly', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate([]);

        $expected = $result->fixedUsage / $result->totalCapacity;
        expect(abs($result->utilization - $expected))->toBeLessThan(0.001);
    });

    it('uses default 256K capacity', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate([]);

        expect($result->totalCapacity)->toBe(256000);
    });

    it('available equals capacity minus usage', function (): void {
        $calc = new ContextBudgetCalculator();
        $result = $calc->calculate([]);

        expect($result->available)->toBe($result->totalCapacity - $result->fixedUsage);
    });

    it('memory adds 800 tokens when enabled', function (): void {
        $calc = new ContextBudgetCalculator();
        $withMemory = $calc->calculate(['memory' => true]);
        $withoutMemory = $calc->calculate(['memory' => false]);

        expect($withMemory->breakdown['memory'])->toBe(800);
        expect($withoutMemory->breakdown['memory'])->toBe(0);
    });

    it('warns when utilization exceeds 30%', function (): void {
        $calc = new ContextBudgetCalculator();
        // Create a large config that pushes past 30%
        $bigClaudeMd = str_repeat('x', 256000); // huge CLAUDE.md
        $result = $calc->calculate(['claudeMd' => $bigClaudeMd]);

        expect($result->warnings)->not->toBeEmpty();
    });

    it('toArray returns correct structure', function (): void {
        $calc = new ContextBudgetCalculator();
        $arr = $calc->calculate([])->toArray();

        expect($arr)->toHaveKey('total_capacity');
        expect($arr)->toHaveKey('fixed_usage');
        expect($arr)->toHaveKey('available');
        expect($arr)->toHaveKey('utilization');
        expect($arr)->toHaveKey('breakdown');
        expect($arr)->toHaveKey('warnings');
    });
});
