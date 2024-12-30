import React, { useState, useEffect, useRef } from "react";
import SuggestionItem from "./SuggestionItem";
import axios from "axios";

const SearchBar = ({ onSuggestionClick, onSearchClick }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef(null);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await axios.get(`${backendUrl}/api/search`, {
                params: { search: query },
            });

            const firstFiveResults = (response.data.data || []).slice(0, 5).map((result) => ({
                id: result.id,
                title: result.title,
                image: result.image,
                category: result.category,
                source: result.source,
                author: result.author,
                content: result.content,
                date: result.created_at,
            }));

            setSuggestions(firstFiveResults);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await axios.get("http://127.0.0.1:8000/api/search", {
                params: { search: searchQuery },
            });

            const searchResults = (response.data.data || []).map((result) => ({
                id: result.id,
                title: result.title,
                image: result.image,
                category: result.category,
                source: result.source,
                author: result.author,
                content: result.content,
                date: result.created_at,
            }));

            onSearchClick({ searchResults, totalResults: searchResults.length });
        } catch (error) {
            console.error("Error performing search:", error);
        }
    };

    const handleClear = () => {
        setSearchQuery("");
        setSuggestions([]);
        onSearchClick(null);
        onSuggestionClick(null);
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            fetchSuggestions(searchQuery);
        }, 300);
        return () => clearTimeout(debounceTimeout);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full">
            <div className="relative w-full">
                {/* Dynamic Icon */}
                <button
                    onClick={searchQuery || suggestions.length ? handleClear : handleSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
                    aria-label={searchQuery || suggestions.length ? "Clear" : "Search"}
                >
                    <i className={`fas ${searchQuery || suggestions.length ? "fa-times" : "fa-search"}`}></i>
                </button>

                {/* Search Input */}
                <input
                    type="text"
                    className="w-full pl-12 pr-16 py-2 text-sm md:text-base rounded-full text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none"
                    placeholder="Search for articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    onFocus={() => setIsFocused(true)}
                    aria-label="Search for articles"
                />

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-1 rounded-full hidden md:block"
                >
                    Search
                </button>

                {/* Icon Button (Mobile) */}
                <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-700 hover:bg-indigo-800 text-white py-1 px-2 rounded-full md:hidden"
                >
                    <i className="fas fa-search"></i>
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg mt-1 z-10"
                >
                    {suggestions.map((suggestion) => (
                        <SuggestionItem
                            key={suggestion.id}
                            imageUrl={suggestion.image}
                            title={suggestion.title}
                            onClick={() => {
                                setIsFocused(false);
                                onSuggestionClick(suggestion); 
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
