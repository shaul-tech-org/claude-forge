<?php

declare(strict_types=1);

namespace App\Services\Recommendation;

use App\DTOs\Recommendation\RecommendationResult;
use App\DTOs\Recommendation\RuleTemplate;
use App\DTOs\Recommendation\SkillTemplate;
use App\DTOs\Recommendation\TechStack;

final class RecommendationEngine
{
    public function __construct(
        private readonly TechStackRegistry $registry,
    ) {}

    /**
     * Generate recommendations for the given stack IDs.
     *
     * Resolves the "implies" chain recursively, deduplicates, and returns
     * categorized rules and skills.
     *
     * @param string[] $stackIds
     */
    public function recommend(array $stackIds): RecommendationResult
    {
        $resolvedIds = $this->resolveImplies($stackIds);
        $stacks = $this->collectStacks($resolvedIds);
        $rules = $this->collectRules($resolvedIds);
        $skills = $this->collectSkills($resolvedIds);

        return new RecommendationResult(
            stacks: $stacks,
            rules: $rules,
            skills: $skills,
        );
    }

    /**
     * Generate detailed recommendations using the RulesDatabase for richer content.
     *
     * Returns comprehensive, documentation-quality rules with DO/DON'T patterns
     * instead of the basic templates from TechStackRegistry.
     *
     * @param string[] $stackIds
     */
    public function recommendDetailed(array $stackIds): RecommendationResult
    {
        $resolvedIds = $this->resolveImplies($stackIds);
        $stacks = $this->collectStacks($resolvedIds);
        $rules = $this->collectDetailedRules($resolvedIds);
        $skills = $this->collectSkills($resolvedIds);

        return new RecommendationResult(
            stacks: $stacks,
            rules: $rules,
            skills: $skills,
        );
    }

    /**
     * Resolve the full chain of implied stacks, deduplicating by ID.
     *
     * @param string[] $stackIds
     * @return string[]
     */
    private function resolveImplies(array $stackIds): array
    {
        $resolved = [];
        $visited = [];

        foreach ($stackIds as $id) {
            $this->resolveStack($id, $resolved, $visited);
        }

        return $resolved;
    }

    /**
     * Recursively resolve a single stack and its implies chain.
     *
     * @param string[] $resolved
     * @param array<string, bool> $visited
     */
    private function resolveStack(string $id, array &$resolved, array &$visited): void
    {
        if (isset($visited[$id])) {
            return;
        }

        $visited[$id] = true;

        $stack = $this->registry->findStack($id);

        if ($stack === null) {
            return;
        }

        $resolved[] = $id;

        foreach ($stack->implies as $impliedId) {
            $this->resolveStack($impliedId, $resolved, $visited);
        }
    }

    /**
     * @param string[] $stackIds
     * @return TechStack[]
     */
    private function collectStacks(array $stackIds): array
    {
        $stacks = [];

        foreach ($stackIds as $id) {
            $stack = $this->registry->findStack($id);

            if ($stack !== null) {
                $stacks[] = $stack;
            }
        }

        return $stacks;
    }

    /**
     * Collect and deduplicate rules from all resolved stacks.
     *
     * @param string[] $stackIds
     * @return RuleTemplate[]
     */
    private function collectRules(array $stackIds): array
    {
        $rules = [];
        $seen = [];

        foreach ($stackIds as $id) {
            foreach ($this->registry->rulesFor($id) as $rule) {
                $key = $rule->label;

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $rules[] = $rule;
            }
        }

        return $rules;
    }

    /**
     * Collect and deduplicate skills from all resolved stacks.
     *
     * @param string[] $stackIds
     * @return SkillTemplate[]
     */
    private function collectSkills(array $stackIds): array
    {
        $skills = [];
        $seen = [];

        foreach ($stackIds as $id) {
            foreach ($this->registry->skillsFor($id) as $skill) {
                $key = $skill->name;

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $skills[] = $skill;
            }
        }

        return $skills;
    }

    /**
     * Collect detailed rules from RulesDatabase, falling back to basic rules
     * from the registry when no detailed rules are available for a stack.
     *
     * @param string[] $stackIds
     * @return RuleTemplate[]
     */
    private function collectDetailedRules(array $stackIds): array
    {
        $rules = [];
        $seen = [];

        foreach ($stackIds as $id) {
            $detailedRules = $this->registry->getDetailedRules($id);
            $source = $detailedRules !== [] ? $detailedRules : $this->registry->rulesFor($id);

            foreach ($source as $rule) {
                $key = $rule->label;

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $rules[] = $rule;
            }
        }

        return $rules;
    }
}
