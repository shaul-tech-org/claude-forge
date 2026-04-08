<?php

declare(strict_types=1);

namespace App\Http\Requests\Harness;

use Illuminate\Foundation\Http\FormRequest;

class EvaluateRequest extends FormRequest
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
            'agents.*.label' => ['sometimes', 'string'],
            'agents.*.name' => ['sometimes', 'string'],
            'agents.*.description' => ['sometimes', 'string'],
            'agents.*.instructions' => ['sometimes', 'string'],
            'skills' => ['sometimes', 'array'],
            'skills.*.label' => ['sometimes', 'string'],
            'skills.*.name' => ['sometimes', 'string'],
            'skills.*.userInvocable' => ['sometimes', 'boolean'],
            'rules' => ['sometimes', 'array'],
            'rules.*.label' => ['sometimes', 'string'],
            'rules.*.name' => ['sometimes', 'string'],
            'rules.*.paths' => ['sometimes', 'array'],
            'rules.*.content' => ['sometimes', 'string'],
            'hooks' => ['sometimes', 'array'],
            'settings' => ['sometimes', 'array'],
            'claudeMd' => ['sometimes', 'string'],
        ];
    }
}
