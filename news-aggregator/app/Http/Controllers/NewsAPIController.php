<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\ArticleUpdated;


class NewsAPIController extends Controller
{
    protected $newsApiKey;

    public function __construct()
    {
        $this->newsApiKey = env('NEWS_API_KEY');
    }

    /**
     * Helper to preprocess fields for escaping special characters
     */
    protected function preprocessField($field, $default = 'Unknown')
    {
        return htmlspecialchars($field ?? $default, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Helper to map article data and validate critical fields
     */
    protected function mapArticleData($articleData, $category = 'Uncategorized')
    {
        // Skip invalid articles with no title or content
        if (empty($articleData['title']) || empty($articleData['content'])) {
            return null;
        }

        return [
            'title' => $this->preprocessField($articleData['title']),
            'author' => $this->preprocessField($articleData['author'] ?? null),
            'source' => ($articleData['url'] ?? 'Unknown Source'),
            'category' => $category,
            'image' => $articleData['urlToImage'] ?? null,
            'content' => $this->preprocessField($articleData['content']),
        ];
    }

    /**
     * Fetch data from the NewsAPI
     */
    protected function fetchArticlesFromAPI($category = 'general')
    {
        return Http::withOptions(['verify' => false])->get('https://newsapi.org/v2/top-headlines', [
            'apiKey' => $this->newsApiKey,
            'country' => 'us',
            'category' => $category,
        ]);
    }

    /**
     * Fetch and save articles to the database
     */
    public function fetchAndSaveArticles(){
        $categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

        set_time_limit(120);
        foreach ($categories as $category) {
            $response = $this->fetchArticlesFromAPI($category);

            if ($response->successful()) {
                $existingTitles = Article::pluck('title')->toArray();

                foreach ($response->json()['articles'] as $articleData) {
                    // Map and validate the article data
                    $mappedData = $this->mapArticleData($articleData, $category);

                    if ($mappedData && !in_array($mappedData['title'], $existingTitles)) {
                        // Save or update the article
                        $article = Article::updateOrCreate(
                            ['title' => $mappedData['title']],
                            $mappedData
                        );

                        // Broadcast the article update
                        if ($article->wasRecentlyCreated || $article->wasChanged()) {
                            // Prepare payload data
                            $payload = $article->only(['id', 'title', 'content', 'time', 'image']);
                            $payloadJson = json_encode($payload);

                            // Check size of payload
                            if (strlen($payloadJson) > 10240) {
                                Log::warning("Payload too large for article '{$article->title}' in category '{$category}'. Skipping broadcast.");
                                continue;
                            }

                            // Broadcast the article
                            broadcast(new ArticleUpdated(json_decode($payloadJson, true)));
                        }
                    } else {
                        Log::warning("Skipped invalid or duplicate article in category {$category}.");
                    }
                }
            } else {
                Log::error("NewsAPI error for category {$category}: " . $response->body());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Articles fetched and saved successfully!',
        ], 200);
    }



}
