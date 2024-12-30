<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use HasFactory, Searchable;

    // Define the table name (optional if it follows the pluralized convention)
    protected $table = 'articles';
    public const FILTERABLE_FIELDS = ['category', 'author', 'source'];


    // Define the fields that can be mass-assigned
    protected $fillable = [
        'title',
        'author',
        'category',
        'source',
        'image',
        'content'
    ];

    // Enable timestamps
    public $timestamps = true;

    // Define the searchable data for Meilisearch
    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'author' => $this->author,
            'source' => $this->source,
            'category' => $this->category,
            'created_at' => $this->created_at,
        ];
    }


    /**
     * Scope: Filter by category (case-insensitive).
     */
    public function scopeByCategory($query, $category)
    {
        if (!$category) {
            return $query;
        }
        return $query->whereRaw('LOWER(category) = ?', [strtolower($category)]);
    }

    /**
     * Scope: Filter by author (case-insensitive).
     */
    public function scopeByAuthor($query, $author)
    {
        if (!$author) {
            return $query;
        }
        return $query->whereRaw('LOWER(author) = ?', [strtolower($author)]);
    }

    /**
     * Scope: Filter by source (case-insensitive).
     */
    public function scopeBySource($query, $source)
    {
        if (!$source) {
            return $query;
        }
        return $query->whereRaw('LOWER(source) = ?', [strtolower($source)]);
    }

    /**
     * Dynamic filter for multiple fields.
     */
    public function scopeFilter($query, $filters)
    {
        if (empty(array_filter($filters))) {
            return $query; // Or handle this case appropriately
        }

        foreach ($filters as $field => $value) {
            if ($value && in_array($field, self::FILTERABLE_FIELDS)) {
                $query->whereRaw('LOWER(' . $field . ') = ?', [strtolower($value)]);
            }
        }
        return $query;
    }



    protected static function boot()
    {
        parent::boot();

        static::saved(function ($article) {
            cache()->forget("article_{$article->id}");
            cache()->forget('articles_all');
        });

        static::deleted(function ($article) {
            cache()->forget("article_{$article->id}");
            cache()->forget('articles_all');
        });
    }


}
