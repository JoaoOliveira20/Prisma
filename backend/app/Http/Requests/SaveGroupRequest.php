<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveGroupRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('groups')->where('user_id', $this->user()->id)->ignore($this->route('group')),
            ],
        ];
    }
}
