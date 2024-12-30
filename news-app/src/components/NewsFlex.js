import React, { useState, useEffect, useRef, useCallback } from "react";
import NewsCard from "./NewsCard";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import BreakingNewsHeader from "./BreakingNewsHeader";

window.Pusher = Pusher;



const echo = new Echo({
  broadcaster: "pusher",
  key: "f70f34ac9012ddaed9bc", // Add your Pusher app key here
  cluster: "eu", // Add your Pusher app cluster here
  forceTLS: true, // Ensure secure connection
});

const NewsFlex = ({ suggestedArticle, searchResults, preferences }) => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); // Track the current search query
  const [selectedCategories, setSelectedCategories] = useState(
    JSON.parse(localStorage.getItem("categories_selected")) || []
  );
  const [selectedSources, setSelectedSources] = useState(
    JSON.parse(localStorage.getItem("sources_selected")) || []
  );
  const [selectedDates, setSelectedDates] = useState({
    start: localStorage.getItem("start_date") || "",
    end: localStorage.getItem("end_date") || "",
  });

  const updateDates = (type, value) => {
    setSelectedDates((prev) => {
      const updated = { ...prev, [type]: value };
      if (!value) {
        localStorage.removeItem(`${type}_date`); // Remove key from localStorage if value is empty
      } else {
        localStorage.setItem(`${type}_date`, value); // Save in localStorage
      }
      return updated;
    });
  };

  // Function to extract domain from a URL
  const extractDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "").split(".")[0];
    } catch {
      return "";
    }
  };

  const filterArticles = (articles, preferences, selectedCategories, selectedSources, selectedDates) => {


    // Convert preferences to arrays if they are strings; otherwise, use them as-is or fallback to an empty array
    const prefCategories = typeof preferences.categories === "string"
      ? preferences.categories.split(",")
      : Array.isArray(preferences.categories)
        ? preferences.categories
        : [];

    const prefSources = typeof preferences.sources === "string"
      ? preferences.sources.split(",")
      : Array.isArray(preferences.sources)
        ? preferences.sources
        : [];

    const prefAuthors = typeof preferences.authors === "string"
      ? preferences.authors.split(",")
      : Array.isArray(preferences.authors)
        ? preferences.authors
        : [];

    // Convert selected filters to arrays

    const selectedCategoriesArr = typeof selectedCategories === "string"
      ? selectedCategories.split(",")
      : Array.isArray(selectedCategories)
        ? selectedCategories
        : [];

    const selectedSourcesArr = typeof selectedSources === "string"
      ? selectedSources.split(",")
      : Array.isArray(selectedSources)
        ? selectedSources
        : [];

    // Helper function to extract domain from a URL
    const extractDomain = (url) => {
      try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, "").split(".")[0];
      } catch {
        return "";
      }
    };

    // Apply filtering logic
    return articles.filter((article) => {
      // Check preferences
      const passesPreferences =
        (!prefCategories.length || prefCategories.includes(article.category)) &&
        (!prefSources.length || prefSources.includes(extractDomain(article.source))) &&
        (!prefAuthors.length || prefAuthors.includes(article.author));

      if (!passesPreferences) return false; // Skip if it doesn't meet preferences


      // Check selected filters
      const passesFilters =
        (!selectedCategoriesArr.length || selectedCategoriesArr.includes(article.category)) &&
        (!selectedSourcesArr.length || selectedSourcesArr.includes(extractDomain(article.source))) &&
        (
          (!selectedDates.start && !selectedDates.end) || // No dates provided
          (selectedDates.start && !selectedDates.end && new Date(article.created_at) >= new Date(selectedDates.start)) || // Only start date provided
          (!selectedDates.start && selectedDates.end && new Date(article.created_at) <= new Date(selectedDates.end)) || // Only end date provided
          (selectedDates.start && selectedDates.end && // Both dates provided
            new Date(article.created_at) >= new Date(selectedDates.start) &&
            new Date(article.created_at) <= new Date(selectedDates.end))
        );

      return passesFilters;
    });
  };






  const clearFilters = () => {
    setSelectedCategories([]); // Reset categories
    setSelectedSources([]); // Reset sources
    setSelectedDates({ start: "", end: "" });
    localStorage.removeItem("categories_selected"); // Clear from localStorage
    localStorage.removeItem("sources_selected"); // Clear from localStorage
    localStorage.removeItem("start_date");
    localStorage.removeItem("end_date");
  };

  const updateCategories = (categories) => {
    setSelectedCategories(categories);
  };

  const updateSources = (sources) => {
    setSelectedSources(sources);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const fetchArticles = useCallback(async (page) => {
    if (searchResults || suggestedArticle) return; // Skip fetching during search or suggestion
    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/articles?page=${page}`
      );
      if (!response.ok) throw new Error("Failed to fetch articles");
      const data = await response.json();

      setArticles((prevArticles) => [
        ...prevArticles,
        ...data.data.filter(
          (newArticle) =>
            !prevArticles.some((article) => article.id === newArticle.id)
        ),
      ]);
      setHasMore(data.next_page_url !== null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchResults, suggestedArticle]);

  const applyFilters = useCallback(() => {


    const extractDomain = (url) => {
      try {
        const domain = new URL(url).hostname; // Extract hostname from URL
        return domain.replace(/^www\./, "").split(".")[0]; // Remove 'www.' and suffix
      } catch (error) {
        console.error("Invalid URL:", url);
        return "";
      }
    };

    let filtered = [...articles];

    if (selectedCategories.length && selectedSources.length) {
      // Filter articles that match both selected categories and sources
      filtered = filtered.filter((article) =>
        selectedCategories.includes(article.category) &&
        selectedSources.includes(extractDomain(article.source))
      );
    } else if (selectedCategories.length) {
      // Filter articles by selected categories only
      filtered = filtered.filter((article) =>
        selectedCategories.includes(article.category)
      );

    } else if (selectedSources.length) {
      // Filter articles by selected sources only
      filtered = filtered.filter((article) =>
        selectedSources.includes(extractDomain(article.source))
      );
    }


    if (selectedDates.start || selectedDates.end) {

      filtered = filtered.filter((article) => {
        const articleDate = new Date(article.created_at);
        const startDate = selectedDates.start ? new Date(selectedDates.start) : null;
        const endDate = selectedDates.end ? new Date(selectedDates.end) : null;

        // Check conditions based on the presence of startDate and endDate
        return (
          (!startDate || articleDate >= startDate) &&
          (!endDate || articleDate <= endDate)
        );
      });
    }

    // Update the filtered articles
    setFilteredArticles(filtered);
  }, [articles, selectedCategories, selectedSources, selectedDates]);


  useEffect(() => {
    //console.log("newsflexx : " + JSON.stringify(preferences))
  }, [preferences]);

  // Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) observer.observe(currentObserverRef);

    return () => {
      if (currentObserverRef) observer.unobserve(currentObserverRef);
    };
  }, [hasMore, loading]);

  // Apply filters whenever articles or selected filters change
  useEffect(() => {
    const filtered = filterArticles(articles, preferences, selectedCategories, selectedSources, selectedDates);
    setFilteredArticles(filtered);
  }, [articles, preferences, selectedCategories, selectedSources, selectedDates]);

  // Fetch articles when the page changes
  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  // Real-time updates
  useEffect(() => {
    const channel = echo.channel("articles");

    channel.listen("ArticleUpdated", (event) => {
      if (event && event.id) {
        setArticles((prevArticles) => {
          if (currentSearchQuery) {
            // Add only if it matches the current search
            const matchesSearch = event.title
              ?.toLowerCase()
              .includes(currentSearchQuery.toLowerCase());
            if (!matchesSearch) return prevArticles;
          }

          const exists = prevArticles.some((article) => article.id === event.id);
          if (exists) return prevArticles; // Avoid duplicates
          return [event, ...prevArticles];
        });
      }
    });

    return () => {
      channel.stopListening("ArticleUpdated");
    };
  }, [currentSearchQuery]);

  // Reset articles when search results are provided
  useEffect(() => {
    if (searchResults) {
      setArticles(searchResults.searchResults);
      setCurrentSearchQuery(searchResults.query || "");
    } else {
      setArticles([]);
      setPage(1);
    }
  }, [searchResults]);

  // Scroll to top when a suggestion or search result is displayed
  useEffect(() => {
    if (suggestedArticle || searchResults) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [suggestedArticle, searchResults]);

  return (

    <div className="container mx-auto p-3 dark:bg-gray-800 dark:text-white">
      {/* Breaking News Header */}
      <BreakingNewsHeader
        searchResults={searchResults}
        toggleFilters={toggleFilters}
        clearFilters={clearFilters}
        updateCategories={updateCategories} // Pass update function
        updateSources={updateSources}
        updateDateRange={updateDates}
      />
      

      {/* Searched Results Section */}
      {searchResults && !suggestedArticle && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 dark:text-gray-300">
            Searched Results ({searchResults.totalResults || 0})
          </h2>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {/* Articles Grid */}
      <div className="flex flex-wrap -mx-4">
        {suggestedArticle ? (
          // Render suggested article only
          <div className="w-full">
            <NewsCard {...suggestedArticle} />
          </div>
        ) : filteredArticles.length > 0 ? (
          // Render filtered articles
          filteredArticles
            .filter((article) => article && article.id) // Ensure valid articles
            .map((article) => (
              <div key={article.id} className="w-full sm:w-1/2 lg:w-1/4 px-4 mb-8">
                <NewsCard {...article} />
              </div>
            ))
        ) : (
          // Display "No Results" message when no articles match filters
          <p className="text-center text-gray-500 w-full">No articles match your filters and preferences.</p>
        )}
      </div>


      {/* Loading Spinner */}
      {loading && <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>}

      {/* Intersection Observer Trigger */}
      {<div ref={observerRef} className="h-4"></div>}

      {/* No More Articles */}
      {!hasMore && !loading && !searchResults && (
        <p className="text-center text-gray-500">No more articles to show.</p>
      )}
    </div>
  );
};

export default NewsFlex;
