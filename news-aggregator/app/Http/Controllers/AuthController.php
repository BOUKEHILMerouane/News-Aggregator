<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log; 

class AuthController extends Controller
{
    // Signup
    public function signup(Request $request)
    {
        Log::info('Signup Request Data:', [
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password, // Be cautious about logging passwords in production
        ]);
        
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Automatically login user after signup
        $token = $user->createToken('authToken')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('authToken')->plainTextToken;

            $response = [
                'message' => 'Login successful!',
                'user' => $user,
                'token' => $token,
            ];

            

            return response()->json([
                'message' => 'Login successful!',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        return response()->json([
            'message' => 'Invalid email or password!',
        ], 401);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully!',
        ], 200);
    }

    // Get Current User
    public function currentUser(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], 200);
    }
}
