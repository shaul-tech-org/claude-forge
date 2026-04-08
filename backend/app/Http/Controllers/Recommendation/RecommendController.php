<?php

declare(strict_types=1);

namespace App\Http\Controllers\Recommendation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recommendation\RecommendRequest;
use App\Services\Recommendation\RecommendationEngine;
use Illuminate\Http\JsonResponse;

class RecommendController extends Controller
{
    public function __construct(
        private readonly RecommendationEngine $engine,
    ) {
    }

    public function __invoke(RecommendRequest $request): JsonResponse
    {
        /** @var string[] $stackIds */
        $stackIds = $request->validated('stacks');
        $result = $this->engine->recommend($stackIds);

        return response()->json([
            'data' => $result->toArray(),
        ]);
    }
}
