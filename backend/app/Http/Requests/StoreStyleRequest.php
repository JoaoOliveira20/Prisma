<?php

namespace App\Http\Requests;

use App\Models\Style;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStyleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            ...Style::imageRules(),
            'name' => ['required', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:500'],
            'history' => ['nullable', 'string', 'max:20000'],
            'influences' => ['nullable', 'string', 'max:5000'],
            'characteristics' => ['nullable', 'array', 'max:20'],
            'characteristics.*' => ['string', 'max:120'],
            'period' => ['nullable', 'string', 'max:80'],
            'origin' => ['nullable', 'string', 'max:120'],
            'cover_url' => ['nullable', 'url:http,https', 'max:2048'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', Rule::exists('tags', 'slug')->where('user_id', $this->user()->id)],
        ];
    }
}
