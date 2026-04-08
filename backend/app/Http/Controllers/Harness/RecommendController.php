<?php

declare(strict_types=1);

namespace App\Http\Controllers\Harness;

use App\Http\Controllers\Controller;
use App\Http\Requests\Harness\RecommendRequest;
use App\Services\Harness\PatternRegistry;
use App\Services\Recommendation\RecommendationEngine;
use Illuminate\Http\JsonResponse;

class RecommendController extends Controller
{
    public function __construct(
        private readonly PatternRegistry $patternRegistry,
        private readonly RecommendationEngine $recommendationEngine,
    ) {}

    public function __invoke(RecommendRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $stacks = $validated['stacks'] ?? [];
        $teamSize = $validated['teamSize'] ?? 1;
        $priorities = $validated['priorities'] ?? [];

        // Get base recommendations from existing engine
        $baseRecommendation = $this->recommendationEngine->recommend($stacks);

        // Recommend patterns based on team size and priorities
        $patterns = $this->recommendPatterns($teamSize, $priorities);

        return response()->json([
            'data' => [
                'patterns' => array_map(fn ($p) => $p->toSummary(), $patterns),
                'rules' => array_map(fn ($r) => $r->toArray(), $baseRecommendation->rules),
                'skills' => array_map(fn ($s) => $s->toArray(), $baseRecommendation->skills),
                'stacks' => array_map(fn ($s) => $s->toArray(), $baseRecommendation->stacks),
            ],
        ]);
    }

    /** @return \App\DTOs\Harness\Pattern[] */
    private function recommendPatterns(int $teamSize, array $priorities): array
    {
        $all = $this->patternRegistry->all();
        $scored = [];

        foreach ($all as $pattern) {
            $score = 0;

            // Team size fitness
            $sizes = explode('-', $pattern->teamSize);
            $min = (int) $sizes[0];
            $max = (int) ($sizes[1] ?? $sizes[0]);
            if ($teamSize >= $min && $teamSize <= $max) {
                $score += 30;
            } elseif ($teamSize <= $max + 2) {
                $score += 15;
            }

            // Priority alignment
            foreach ($priorities as $priority) {
                $axisScore = $pattern->expectedScores[$priority] ?? 0;
                $score += (int) ($axisScore * 0.5);
            }

            $scored[] = ['pattern' => $pattern, 'score' => $score];
        }

        usort($scored, static fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_map(static fn ($item) => $item['pattern'], array_slice($scored, 0, 3));
    }
}
