<?php

declare(strict_types=1);

namespace App\Http\Controllers\Harness;

use App\Http\Controllers\Controller;
use App\Services\Harness\PatternRegistry;
use Illuminate\Http\JsonResponse;

class PatternController extends Controller
{
    public function __construct(
        private readonly PatternRegistry $registry,
    ) {}

    public function index(): JsonResponse
    {
        $patterns = array_map(
            static fn ($pattern): array => $pattern->toSummary(),
            $this->registry->all(),
        );

        return response()->json([
            'data' => $patterns,
            'categories' => $this->registry->categories(),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $pattern = $this->registry->find($id);

        if ($pattern === null) {
            return response()->json(['error' => 'Pattern not found'], 404);
        }

        return response()->json([
            'data' => $pattern->toArray(),
        ]);
    }
}
