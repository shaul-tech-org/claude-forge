<?php

declare(strict_types=1);

namespace App\Http\Requests\Recommendation;

use Illuminate\Foundation\Http\FormRequest;

class RecommendRequest extends FormRequest
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
            'stacks' => ['required', 'array', 'min:1'],
            'stacks.*' => ['required', 'string', 'max:64'],
        ];
    }
}
