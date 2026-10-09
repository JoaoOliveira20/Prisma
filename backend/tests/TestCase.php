<?php

namespace Tests;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function tagFor(User $user, string $name): Tag
    {
        $tag = Tag::make(['name' => $name]);
        $tag->user_id = $user->id;
        $tag->save();

        return $tag;
    }
}
