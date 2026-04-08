<?php

declare(strict_types=1);

namespace App\Services\Cli;

use App\DTOs\Cli\ClaudeConfig;
use App\DTOs\Cli\ValidationError;
use App\DTOs\Cli\ValidationResult;

class ClaudeConfigValidator
{
    private const array ALLOWED_MODELS = ['sonnet', 'haiku', 'opus'];

    public function validate(ClaudeConfig $config): ValidationResult
    {
        $errors = [];

        $this->validateAgents($config, $errors);
        $this->validateSkills($config, $errors);
        $this->validateRules($config, $errors);

        return new ValidationResult(
            valid: $errors === [],
            errors: $errors,
        );
    }

    /**
     * @param ValidationError[] $errors
     */
    private function validateAgents(ClaudeConfig $config, array &$errors): void
    {
        foreach ($config->agents as $index => $agent) {
            if (trim($agent->name) === '') {
                $errors[] = new ValidationError(
                    field: "agents[{$index}].name",
                    message: 'Agent name is required.',
                );
            }

            if (! in_array($agent->model, self::ALLOWED_MODELS, strict: true)) {
                $errors[] = new ValidationError(
                    field: "agents[{$index}].model",
                    message: sprintf(
                        'Agent model must be one of: %s. Got "%s".',
                        implode(', ', self::ALLOWED_MODELS),
                        $agent->model,
                    ),
                );
            }
        }
    }

    /**
     * @param ValidationError[] $errors
     */
    private function validateSkills(ClaudeConfig $config, array &$errors): void
    {
        foreach ($config->skills as $index => $skill) {
            if (trim($skill->name) === '') {
                $errors[] = new ValidationError(
                    field: "skills[{$index}].name",
                    message: 'Skill name is required.',
                );
            }
        }
    }

    /**
     * @param ValidationError[] $errors
     */
    private function validateRules(ClaudeConfig $config, array &$errors): void
    {
        foreach ($config->rules as $index => $rule) {
            if (trim($rule->label) === '') {
                $errors[] = new ValidationError(
                    field: "rules[{$index}].label",
                    message: 'Rule label is required.',
                );
            }
        }
    }
}
