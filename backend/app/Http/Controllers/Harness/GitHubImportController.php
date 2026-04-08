<?php

declare(strict_types=1);

namespace App\Http\Controllers\Harness;

use App\Http\Controllers\Controller;
use App\Services\Harness\GitHubImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitHubImportController extends Controller
{
    public function __construct(
        private readonly GitHubImportService $importService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string', 'url'],
        ]);

        $result = $this->importService->import($request->input('url'));

        return response()->json([
            'data' => $result,
        ]);
    }
}
