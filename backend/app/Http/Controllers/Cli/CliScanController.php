<?php

declare(strict_types=1);

namespace App\Http\Controllers\Cli;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cli\ScanRequest;
use App\Services\Cli\ClaudeConfigScanner;
use Illuminate\Http\JsonResponse;

class CliScanController extends Controller
{
    public function __construct(
        private readonly ClaudeConfigScanner $scanner,
    ) {
    }

    public function __invoke(ScanRequest $request): JsonResponse
    {
        $path = $request->input('path', config('forge.project_root'));
        $result = $this->scanner->scan($path);

        return response()->json($result->toArray());
    }
}
