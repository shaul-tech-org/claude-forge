<?php

declare(strict_types=1);

namespace App\Http\Requests\Harness;

use Illuminate\Foundation\Http\FormRequest;

class ContextBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'agents' => ['sometimes', 'array'],
            'agents.*.instructions' => ['sometimes', 'string'],
            'rules' => ['sometimes', 'array'],
            'rules.*.content' => ['sometimes', 'string'],
            'skills' => ['sometimes', 'array'],
            'hooks' => ['sometimes', 'array'],
            'claudeMd' => ['sometimes', 'string'],
            'memory' => ['sometimes', 'boolean'],
        ];
    }
}
