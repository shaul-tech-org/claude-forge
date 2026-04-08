<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cli;

use App\DTOs\Cli\ClaudeConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cli\ValidateRequest;
use App\Services\Cli\ClaudeConfigValidator;
use Illuminate\Http\JsonResponse;

class CliValidateController extends Controller
{
    public function __construct(
        private readonly ClaudeConfigValidator $validator,
    ) {}

    public function __invoke(ValidateRequest $request): JsonResponse
    {
        $config = ClaudeConfig::fromArray($request->input('config'));
        $result = $this->validator->validate($config);

        return response()->json($result->toArray());
    }
}
