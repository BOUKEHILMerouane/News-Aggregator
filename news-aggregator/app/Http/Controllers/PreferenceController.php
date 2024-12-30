<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;

class PreferenceController extends Controller
{
    // Save or update preferences
    public function savePreferences(Request $request)
    {
        $request->validate([
            'categories' => 'array',
            'authors' => 'array',
            'sources' => 'array',
        ]);

        $user = auth()->user();

        $preference = Preference::updateOrCreate(
            ['user_id' => $user->id],
            [
                'categories' => $request->categories ?? [],
                'authors' => $request->authors ?? [],
                'sources' => $request->sources ?? [],
            ]
        );

        return response()->json([
            'message' => 'Preferences saved successfully',
            'preferences' => $preference,
        ], 200);
    }

    // Retrieve preferences
    public function getPreferences()
    {
        $user = auth()->user();

        $preferences = Preference::where('user_id', $user->id)->first();

        return response()->json([
            'preferences' => $preferences ?? [
                'categories' => [],
                'authors' => [],
                'sources' => [],
            ],
        ], 200);
    }
}
