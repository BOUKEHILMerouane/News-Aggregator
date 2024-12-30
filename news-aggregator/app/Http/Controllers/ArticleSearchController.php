<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;
use App\Events\ArticleUpdated;

class ArticleSearchController extends Controller
{
    /**
     * Handle live suggestions while typing.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function suggest(Request $request)
    {
        $request->validate([
            'search' => 'required|string|max:255',
        ]);

        $searchTerm = $request->input('search'); // Get the search term
        $filters = [
            'category' => $request->input('category'), // Optional category filter
            'source' => $request->input('source'),     // Optional source filter
        ];

        $preferences = $this->getUserPreferences($request); // User preferences

        // Build the filter string for Meilisearch
        $filterString = $this->buildFilterString(array_merge($filters, $preferences));

        try {
            // Perform the search with filters and limit the results to 5
            $results = Article::search($searchTerm)
                ->when($filterString, fn($query) => $query->filter($filterString)) // Apply filters
                ->take(5) // Limit to top 5 suggestions
                ->get()
                ->map(function ($article) {
                    return [
                        'title' => $article->title,
                        'author' => $article->author,
                        'source' => $article->source,
                        'image' => $article->image,
                        'contentSnippet' => substr($article->content, 0, 100) . '...', // Short snippet of content
                    ];
                });

            return response()->json($results);

        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while fetching suggestions.'], 500);
        }
    }




    /**
     * Handle full search with filters and user preferences.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'category' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:50',
        ]);

        // Input handling
        $searchTerm = $request->input('search', ''); // Default to empty string if no keyword is provided
        $filters = [
            'category' => $request->input('category'),
            'source' => $request->input('source'),
        ];
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // User preferences (for personalized news feed)
        $preferences = $this->getUserPreferences($request);

        try {
            // Build filter string for Meilisearch
            $filterString = $this->buildFilterString(array_merge($filters, $preferences));

            // Perform the search
            $results = Article::search($searchTerm)
                ->when($filterString, fn($query) => $query->filter($filterString))
                ->when($dateFrom && $dateTo, fn($query) => $query->filter("created_at BETWEEN $dateFrom AND $dateTo"))
                ->paginate(20);

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while searching.'], 500);
        }
    }





    /**
     * Get paginated articles with optional user preferences.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function articles(Request $request)
    {
        $request->validate([
            'sources' => 'nullable|array',
            'categories' => 'nullable|array',
            'authors' => 'nullable|array',
            'sources.*' => 'string|max:50',
            'categories.*' => 'string|max:50',
            'authors.*' => 'string|max:50',
            'page' => 'nullable|integer|min:1', // Add page validation
        ]);

        $preferences = [
            'sources' => $request->input('sources', []),
            'categories' => $request->input('categories', []),
            'authors' => $request->input('authors', []),
        ];

        $perPage = 20; // Number of articles per page
        $articles = Article::query()
            ->when($preferences['sources'], fn($query) => $query->whereIn('source', $preferences['sources']))
            ->when($preferences['categories'], fn($query) => $query->whereIn('category', $preferences['categories']))
            ->when($preferences['authors'], fn($query) => $query->whereIn('author', $preferences['authors']))
            ->orderBy('created_at', 'desc') // Show the latest articles first
            ->paginate($perPage); // Laravel's pagination method

        return response()->json($articles);
    }


    /**
     * Build the filter string for the search query.
     *
     * @param array $filters
     * @return string|null
     */
    private function buildFilterString(array $filters): ?string
    {
        return collect($filters)
            ->filter()
            ->map(fn($value, $key) => "$key = \"$value\"")
            ->join(' AND ');
    }

    /**
     * Fetch user preferences (Simulated for now).
     *
     * @return array
     */
    public function getUserPreferences(Request $request): array
    {
        $validated = $request->validate([
            'sources' => 'nullable|array',
            'categories' => 'nullable|array',
            'authors' => 'nullable|array',
            'sources.*' => 'string|max:50',
            'categories.*' => 'string|max:50',
            'authors.*' => 'string|max:50',
        ]);

        if (auth()->check()) {
            $user = auth()->user();

            return [
                'sources' => $validated['sources'] ?? $user->preferred_sources ?? [],
                'categories' => $validated['categories'] ?? $user->preferred_categories ?? [],
                'authors' => $validated['authors'] ?? $user->preferred_authors ?? [],
            ];
        }

        return [
            'sources' => $validated['sources'] ?? [],
            'categories' => $validated['categories'] ?? [],
            'authors' => $validated['authors'] ?? [],
        ];
    }



    public function deleteAllArticles()
    {
        Article::truncate();

        // Fetch updated articles (should be empty after truncate)
        $articles = Article::all();

        // Broadcast the updated articles
        event(new ArticleUpdated($articles));

        return response()->json(['message' => 'All articles deleted and broadcasted.']);
    }

    /**
     * Fetch available sources.
     */
    public function getSources()
    {
        try {
            $sources = Article::pluck('source')->toArray();

            // Extract the base domain names
            $parsedSources = collect($sources)
                ->filter() // Remove null or empty sources
                ->map(function ($url) {
                    $host = parse_url($url, PHP_URL_HOST);
                    if (!$host) {
                        return null; // Handle invalid URLs
                    }
                    // Extract the main domain
                    $parts = explode('.', $host);
                    if (count($parts) > 2) {
                        return $parts[count($parts) - 2]; // Use second to last part for subdomains
                    }
                    return $parts[0];
                })
                ->unique() // Remove duplicates
                ->values() // Reindex the array
                ->toArray();

            return response()->json($parsedSources, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while fetching sources.'], 500);
        }
    }


    /**
     * Fetch available categories.
     */
    public function getCategories(Request $request)
    {
        $categories = Article::query()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return response()->json($categories, 200);
    }

    public function getAuthors(Request $request)
    {
        $categories = Article::query()
            ->distinct()
            ->pluck('author')
            ->filter()
            ->values();

        return response()->json($categories, 200);
    }



}
