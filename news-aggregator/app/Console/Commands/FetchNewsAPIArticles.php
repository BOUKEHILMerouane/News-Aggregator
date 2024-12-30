<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\NewsAPIController;

class FetchNewsAPIArticles extends Command
{
    protected $signature = 'articles:fetch-newsapi';
    protected $description = 'Fetch articles from NewsAPI and save to the database';

    public function handle()
    {
        app(NewsAPIController::class)->fetchAndSaveArticles();
        $this->info('Fetched articles from NewsAPI successfully!');
    }
}
