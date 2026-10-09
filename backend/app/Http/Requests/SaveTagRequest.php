<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTagRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:40', Rule::unique('tags', 'name')->where('user_id', $this->user()->id)->ignore($this->route('tag'))],
        ];
    }
}
