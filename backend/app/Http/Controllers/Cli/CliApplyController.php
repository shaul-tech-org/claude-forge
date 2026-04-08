<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cli;

use App\DTOs\Cli\ClaudeConfig;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cli\ApplyRequest;
use App\Services\Cli\ClaudeConfigWriter;
use Illuminate\Http\JsonResponse;

class CliApplyController extends Controller
{
    public function __construct(
        private readonly ClaudeConfigWriter $writer,
    ) {
    }

    public function __invoke(ApplyRequest $request): JsonResponse
    {
        $path = $request->input('path', config('forge.project_root'));
        $config = ClaudeConfig::fromArray($request->input('config'));
        $mode = $request->input('mode', 'merge');
        $result = $this->writer->apply($path, $config, $mode);

        return response()->json($result->toArray());
    }
}
