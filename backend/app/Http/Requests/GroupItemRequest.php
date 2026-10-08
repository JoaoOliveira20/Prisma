<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GroupItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:style,person,strategy,reference'],
            'slug' => ['required', 'string', 'max:255'],
        ];
    }
}
