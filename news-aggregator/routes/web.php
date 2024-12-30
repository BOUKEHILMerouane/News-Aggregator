<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsAPIController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\GuardianAPIController;
use App\Http\Controllers\NYTAPIController;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/fetch-articles', [NewsAPIController::class, 'fetchAndSaveArticles']);
Route::get('/fetch-guardian-articles', [GuardianAPIController::class, 'fetchAndSaveArticles']);
Route::get('/fetch-ny-articles', [NYTAPIController::class, 'fetchAndSaveArticles']);



