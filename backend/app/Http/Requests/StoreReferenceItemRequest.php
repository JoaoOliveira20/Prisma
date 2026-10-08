<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreReferenceItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'image' => ['nullable', 'required_without:image_url', File::image(allowSvg: false)->max(5 * 1024)],
            'image_url' => ['nullable', 'required_without:image', 'url:http,https', 'max:2048'],
            'source_url' => ['nullable', 'url:http,https', 'max:2048'],
            'credit' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:1000'],
            'links' => ['nullable', 'array', 'max:20'],
            'links.*.type' => ['required', Rule::in(['style', 'person', 'strategy'])],
            'links.*.slug' => ['required', 'string', 'max:255'],
        ];
    }
}
