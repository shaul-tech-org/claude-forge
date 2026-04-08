<?php

declare(strict_types=1);

namespace App\Http\Controllers\Harness;

use App\Http\Controllers\Controller;
use App\Http\Requests\Harness\ContextBudgetRequest;
use App\Services\Harness\ContextBudgetCalculator;
use Illuminate\Http\JsonResponse;

class ContextBudgetController extends Controller
{
    public function __construct(
        private readonly ContextBudgetCalculator $calculator,
    ) {}

    public function __invoke(ContextBudgetRequest $request): JsonResponse
    {
        $result = $this->calculator->calculate($request->validated());

        return response()->json([
            'data' => $result->toArray(),
        ]);
    }
}
