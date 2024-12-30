<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\GuardianAPIController;

class FetchGuardianArticles extends Command
{
    protected $signature = 'articles:fetch-guardian';
    protected $description = 'Fetch articles from The Guardian API and save to the database';

    public function handle()
    {
        app(GuardianAPIController::class)->fetchAndSaveArticles();
        $this->info('Fetched articles from The Guardian API successfully!');
    }
}
