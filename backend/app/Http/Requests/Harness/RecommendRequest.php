<?php

declare(strict_types=1);

namespace App\Http\Requests\Harness;

use Illuminate\Foundation\Http\FormRequest;

class RecommendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'stacks' => ['sometimes', 'array'],
            'stacks.*' => ['string'],
            'teamSize' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'priorities' => ['sometimes', 'array'],
            'priorities.*' => ['string', 'in:context,verification,state,tools,human,lifecycle'],
            'workTypes' => ['sometimes', 'array'],
            'workTypes.*' => ['string'],
        ];
    }
}
