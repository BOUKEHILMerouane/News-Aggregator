<?php

// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsAPIController;
use App\Http\Controllers\ArticleSearchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PreferenceController;



// Unified route for general articles and personalized feed
Route::get('/articles', [ArticleSearchController::class, 'articles']);

// Route for live suggestions while typing
Route::get('/suggest', [ArticleSearchController::class, 'suggest']);

// Route for full search with filters and user preferences
Route::get('/search', [ArticleSearchController::class, 'search']);

// Route for full categories
Route::get('/filter/categories', [ArticleSearchController::class, 'getCategories']);

// Route for full sources
Route::get('/filter/sources', [ArticleSearchController::class, 'getSources']);

// Route for prefered categories
Route::get('/preference/categories', [ArticleSearchController::class, 'getCategories']);

// Route for prefered Authors
Route::get('/preference/authors', [ArticleSearchController::class, 'getAuthors']);

// Route for prefered Sources
Route::get('/preference/sources', [ArticleSearchController::class, 'getSources']);

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'currentUser'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/preferences', [PreferenceController::class, 'savePreferences']);
    Route::get('/preferences', [PreferenceController::class, 'getPreferences']);
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok'], 200);
});