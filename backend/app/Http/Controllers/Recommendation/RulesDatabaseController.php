<?php

declare(strict_types=1);

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Services\Recommendation\RulesDatabase;
use Illuminate\Http\JsonResponse;

class RulesDatabaseController extends Controller
{
    /**
     * GET /api/v1/rules-db
     *
     * List all available rules in the database, grouped by stack ID.
     */
    public function index(): JsonResponse
    {
        $all = RulesDatabase::all();
        $data = [];

        foreach ($all as $stackId => $rules) {
            $data[$stackId] = array_map(
                static fn($rule): array => $rule->toArray(),
                $rules,
            );
        }

        return response()->json([
            'data' => $data,
            'meta' => [
                'total_stacks' => count($all),
                'total_rules' => count(RulesDatabase::flatList()),
            ],
        ]);
    }

    /**
     * GET /api/v1/rules-db/{stackId}
     *
     * Get detailed rules for a specific stack.
     */
    public function show(string $stackId): JsonResponse
    {
        $rules = RulesDatabase::forStack($stackId);

        if ($rules === []) {
            return response()->json([
                'error' => 'No rules found for stack: ' . $stackId,
                'available_stacks' => RulesDatabase::availableStacks(),
            ], 404);
        }

        return response()->json([
            'data' => [
                'stack_id' => $stackId,
                'rules' => array_map(
                    static fn($rule): array => $rule->toArray(),
                    $rules,
                ),
                'count' => count($rules),
            ],
        ]);
    }
}
