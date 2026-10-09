<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReferenceItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'source_url' => ['nullable', 'url:http,https', 'max:2048'],
            'credit' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:1000'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', Rule::exists('tags', 'slug')->where('user_id', $this->user()->id)],
            'links' => ['nullable', 'array', 'max:20'],
            'links.*.type' => ['required', Rule::in(['style', 'person', 'strategy'])],
            'links.*.slug' => ['required', 'string', 'max:255'],
        ];
    }
}
