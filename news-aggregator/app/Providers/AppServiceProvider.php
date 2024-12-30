<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the CORS middleware globally
        $router = app('router');

        // Apply CORS middleware globally to the 'web' group
        $router->pushMiddlewareToGroup('web', \App\Http\Middleware\CorsMiddleware::class);

        // Optionally, register it for API routes as well (if needed)
        $router->pushMiddlewareToGroup('api', \App\Http\Middleware\CorsMiddleware::class);

        // Load the API routes manually
        Route::prefix('api')
            ->middleware('api')
            ->group(base_path('routes/api.php'));  // Load the api.php routes
    }
}
