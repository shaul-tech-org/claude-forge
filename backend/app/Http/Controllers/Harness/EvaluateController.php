<?php

declare(strict_types=1);

namespace App\Http\Controllers\Harness;

use App\Http\Controllers\Controller;
use App\Http\Requests\Harness\EvaluateRequest;
use App\Services\Harness\HarnessEvaluationService;
use Illuminate\Http\JsonResponse;

class EvaluateController extends Controller
{
    public function __construct(
        private readonly HarnessEvaluationService $evaluationService,
    ) {}

    public function __invoke(EvaluateRequest $request): JsonResponse
    {
        $result = $this->evaluationService->evaluate($request->validated());

        return response()->json([
            'data' => $result->toArray(),
        ]);
    }
}
