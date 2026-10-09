<?php

namespace App\Http\Requests;

use App\Models\Strategy;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStrategyRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            ...Strategy::imageRules(),
            'name' => ['required', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:80'],
            'summary' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'cover_url' => ['nullable', 'url:http,https', 'max:2048'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', Rule::exists('tags', 'slug')->where('user_id', $this->user()->id)],
            'styles' => ['nullable', 'array', 'max:50'],
            'styles.*' => ['string', Rule::exists('styles', 'slug')->where('user_id', $this->user()->id)],
        ];
    }
}
