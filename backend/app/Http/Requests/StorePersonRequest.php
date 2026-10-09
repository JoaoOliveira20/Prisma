<?php

namespace App\Http\Requests;

use App\Models\Person;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePersonRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            ...Person::imageRules(),
            'name' => ['required', 'string', 'max:120'],
            'role' => ['nullable', 'string', 'max:120'],
            'summary' => ['nullable', 'string', 'max:500'],
            'biography' => ['nullable', 'string', 'max:20000'],
            'period' => ['nullable', 'string', 'max:80'],
            'origin' => ['nullable', 'string', 'max:120'],
            'photo_url' => ['nullable', 'url:http,https', 'max:2048'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', Rule::exists('tags', 'slug')->where('user_id', $this->user()->id)],
            'styles' => ['nullable', 'array', 'max:50'],
            'styles.*' => ['string', Rule::exists('styles', 'slug')->where('user_id', $this->user()->id)],
        ];
    }
}
