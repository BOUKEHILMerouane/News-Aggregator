<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\NYTAPIController;

class FetchNYTArticles extends Command
{
    protected $signature = 'articles:fetch-nyt';
    protected $description = 'Fetch articles from the New York Times API and save to the database';

    public function handle()
    {
        app(NYTAPIController::class)->fetchAndSaveArticles();
        $this->info('Fetched articles from the New York Times API successfully!');
    }
}
