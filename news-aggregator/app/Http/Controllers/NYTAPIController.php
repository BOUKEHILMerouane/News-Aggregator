<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\ArticleUpdated;

class NYTAPIController extends Controller
{
    protected $nytApiKey;

    public function __construct()
    {
        $this->nytApiKey = env('NYT_API_KEY'); // Load API key from .env
    }

    /**
     * Fetch data from New York Times Top Stories API
     *
     * @param string $section
     * @return array|null
     */
    protected function fetchTopStories($section = 'home')
    {
        $url = "https://api.nytimes.com/svc/topstories/v2/{$section}.json";

        $params = [
            'api-key' => $this->nytApiKey,
        ];
        Log::info("Sending request to NYT API", [
            'url' => $url,
            'params' => $params,
        ]);

        $response = Http::withOptions(['verify' => false])->get($url, [
            
            'api-key' => $this->nytApiKey,
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error("Failed to fetch NYT top stories for section {$section}: " . $response->body());
        return null;
    }

    /**
     * Map NYT article data to the local format
     *
     * @param array $articleData
     * @param string $category
     * @return array|null
     */
    protected function mapArticleData($articleData, $category = 'Uncategorized')
    {
        if (empty($articleData['title']) || empty($articleData['abstract'])) {
            return null;
        }

        return [
            'title' => htmlspecialchars($articleData['title'], ENT_QUOTES, 'UTF-8'),
            'content' => htmlspecialchars($articleData['abstract'], ENT_QUOTES, 'UTF-8'),
            'image' => $articleData['multimedia'][0]['url'] ?? null, // Fetch first image if available
            'source' => $articleData['url'] ?? 'Unknown Source',
            'category' => $category,
            'time' => $articleData['published_date'] ?? null,
            'author' => htmlspecialchars($articleData['byline'] ?? 'Unknown', ENT_QUOTES, 'UTF-8'),
        ];
    }

    /**
     * Fetch and save articles from NYT
     */
    public function fetchAndSaveArticles()
    {
        $sections = ['home', 'world', 'politics', 'technology', 'health', 'science', 'sports'];

        set_time_limit(120);
        foreach ($sections as $section) {
            $response = $this->fetchTopStories($section);

            if ($response && isset($response['results'])) {
                foreach ($response['results'] as $articleData) {
                    $mappedData = $this->mapArticleData($articleData, $section);

                    if ($mappedData) {
                        // Use updateOrCreate to handle both updates and inserts
                        $article = Article::updateOrCreate(
                            ['title' => $mappedData['title']], // Ensure uniqueness
                            $mappedData
                        );

                        if ($article->wasRecentlyCreated || $article->wasChanged()) {
                            // Prepare payload data
                            $payload = $article->only(['id', 'title', 'content', 'time', 'image']);
                            $payloadJson = json_encode($payload);

                            // Check size of payload
                            if (strlen($payloadJson) > 10240) {
                                Log::warning("Payload too large for article '{$article->title}' in sections '{$section}'. Skipping broadcast.");
                                continue;
                            }

                            // Broadcast the article
                            broadcast(new ArticleUpdated(json_decode($payloadJson, true)));
                        }
                    } else {
                        Log::warning("Skipped invalid NYT article in section {$section}: " . json_encode($articleData));
                    }
                }
            } else {
                Log::error("Failed to fetch NYT articles for section {$section}. Response: " . json_encode($response));
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'NYT articles fetched and saved successfully!',
        ]);
    }

}
