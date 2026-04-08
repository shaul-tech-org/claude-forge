<?php

declare(strict_types=1);

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Services\Recommendation\TechStackRegistry;
use Illuminate\Http\JsonResponse;

class TechStackController extends Controller
{
    public function __construct(
        private readonly TechStackRegistry $registry,
    ) {}

    public function __invoke(): JsonResponse
    {
        $stacks = array_map(
            static fn($stack): array => $stack->toArray(),
            $this->registry->allStacks(),
        );

        return response()->json([
            'data' => $stacks,
        ]);
    }
}
