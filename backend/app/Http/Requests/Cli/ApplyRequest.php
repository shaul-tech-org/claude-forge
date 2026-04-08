<?php

declare(strict_types=1);

namespace App\Http\Requests\Cli;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'path' => ['sometimes', 'string', 'max:1024'],
            'config' => ['required', 'array'],
            'config.agents' => ['sometimes', 'array'],
            'config.agents.*.name' => ['required', 'string'],
            'config.agents.*.description' => ['sometimes', 'string'],
            'config.agents.*.model' => ['sometimes', 'string'],
            'config.agents.*.instructions' => ['sometimes', 'string'],
            'config.skills' => ['sometimes', 'array'],
            'config.skills.*.name' => ['required', 'string'],
            'config.skills.*.description' => ['sometimes', 'string'],
            'config.skills.*.userInvocable' => ['sometimes', 'boolean'],
            'config.skills.*.args' => ['sometimes', 'string'],
            'config.skills.*.trigger' => ['sometimes', 'string'],
            'config.skills.*.instructions' => ['sometimes', 'string'],
            'config.rules' => ['sometimes', 'array'],
            'config.rules.*.label' => ['required', 'string'],
            'config.rules.*.category' => ['sometimes', 'string'],
            'config.rules.*.paths' => ['sometimes', 'array'],
            'config.rules.*.paths.*' => ['string'],
            'config.rules.*.content' => ['sometimes', 'string'],
            'mode' => ['sometimes', 'string', Rule::in(['merge', 'overwrite'])],
        ];
    }
}
