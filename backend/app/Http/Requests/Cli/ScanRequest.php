<?php

declare(strict_types=1);

namespace App\Http\Requests\Cli;

use Illuminate\Foundation\Http\FormRequest;

class ScanRequest extends FormRequest
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
        ];
    }
}
