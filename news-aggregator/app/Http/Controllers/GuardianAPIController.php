<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Events\ArticleUpdated;

class GuardianAPIController extends Controller
{
    protected $guardianApiKey;

    public function __construct()
    {
        $this->guardianApiKey = env('GUARDIAN_API_KEY'); // Load API key from .env
    }

    /**
     * Fetch articles from The Guardian API
     *
     * @param string $query
     * @param string|null $section
     * @param int $pageSize
     * @return array|null
     */
    protected function fetchArticles($query = 'technology', $section = null, $pageSize = 10)
    {
        $url = 'https://content.guardianapis.com/search';

        $response = Http::withOptions(['verify' => false])->get($url, [
            'api-key' => $this->guardianApiKey,
            'q' => $query,
            'section' => $section,
            'page-size' => $pageSize,
            'order-by' => 'newest',
            'show-fields' => 'headline,body,thumbnail,byline',
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('Failed to fetch articles from The Guardian: ' . $response->body());
        return null;
    }

    /**
     * Map article data and validate fields
     *
     * @param array $articleData
     * @param string $category
     * @return array|null
     */
    protected function mapArticleData($articleData, $category = 'Uncategorized')
    {
        // Validate required fields
        if (empty($articleData['fields']['headline']) || empty($articleData['fields']['body'])) {
            return null;
        }

        return [
            'title' => htmlspecialchars($articleData['fields']['headline'], ENT_QUOTES, 'UTF-8'),
            'content' => htmlspecialchars($articleData['fields']['body'], ENT_QUOTES, 'UTF-8'),
            'image' => $articleData['fields']['thumbnail'] ?? null,
            'source' => $articleData['webUrl'] ?? 'Unknown Source',
            'category' => $articleData['sectionName'] ?? $category,
            'time' => $articleData['webPublicationDate'] ?? null,
            'author' => htmlspecialchars($articleData['fields']['byline'] ?? 'Unknown', ENT_QUOTES, 'UTF-8'),
        ];
    }

    /**
     * Fetch and save articles from The Guardian API
     */
    public function fetchAndSaveArticles()
    {
        set_time_limit(120);
        $categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

        foreach ($categories as $category) {
            $response = $this->fetchArticles(query: $category, section: $category);

            if (!empty($response['response']['results'])) {
                $existingTitles = Article::pluck('title')->flip()->toArray();

                foreach ($response['response']['results'] as $articleData) {
                    $mappedData = $this->mapArticleData($articleData, $category);

                    if ($mappedData && !isset($existingTitles[$mappedData['title']])) {
                        $article = Article::updateOrCreate(
                            ['title' => $mappedData['title']],
                            $mappedData
                        );

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
                        Log::warning("Skipped invalid or duplicate article '{$mappedData['title']}' in category '{$category}'.");
                    }
                }
            } else {
                Log::error("Failed to fetch articles for category '{$category}'. Response: " . json_encode($response));
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Articles fetched and saved successfully!',
            'categories_processed' => count($categories),
        ], 200);
    }


}
