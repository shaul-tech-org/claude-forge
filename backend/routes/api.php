<?php

declare(strict_types=1);

use App\Http\Controllers\Cli\CliApplyController;
use App\Http\Controllers\Cli\CliScanController;
use App\Http\Controllers\Cli\CliValidateController;
use App\Http\Controllers\Harness\ContextBudgetController;
use App\Http\Controllers\Harness\EvaluateController;
use App\Http\Controllers\Harness\PatternController;
use App\Http\Controllers\Harness\GitHubImportController;
use App\Http\Controllers\Harness\RecommendController as HarnessRecommendController;
use App\Http\Controllers\Recommendation\RecommendController;
use App\Http\Controllers\Recommendation\RulesDatabaseController;
use App\Http\Controllers\Recommendation\TechStackController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1/cli')->group(function (): void {
    Route::post('/scan', CliScanController::class);
    Route::post('/apply', CliApplyController::class);
    Route::post('/validate', CliValidateController::class);
});

Route::prefix('v1')->group(function (): void {
    Route::get('/stacks', TechStackController::class);
    Route::post('/recommendations', RecommendController::class);
    Route::get('/rules-db', [RulesDatabaseController::class, 'index']);
    Route::get('/rules-db/{stackId}', [RulesDatabaseController::class, 'show']);

    // Harness Pattern API
    Route::get('/patterns', [PatternController::class, 'index']);
    Route::get('/patterns/{id}', [PatternController::class, 'show']);

    // Harness Evaluation & Budget API
    Route::post('/harness/evaluate', EvaluateController::class);
    Route::post('/harness/context-budget', ContextBudgetController::class);
    Route::post('/harness/recommend', HarnessRecommendController::class);

    // Import API
    Route::post('/import/github', GitHubImportController::class);
});
