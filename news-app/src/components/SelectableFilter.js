import React, { useState, useEffect } from "react";
import axios from "axios";

const SelectableFilter = ({ filterType, onSelectionChange, onClear }) => {
    const [options, setOptions] = useState([]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    const [selectedOptions, setSelectedOptions] = useState(() => {
        // Load persisted options from localStorage
        const storedOptions = localStorage.getItem(`${filterType}_selected`);
        return storedOptions ? JSON.parse(storedOptions) : [];
    });

    const cacheWithExpiration = (key, data, ttl) => {
        const expiration = Date.now() + ttl;
        const cachedData = { data, expiration };
        localStorage.setItem(key, JSON.stringify(cachedData));
    };

    const getCachedData = (key) => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;
    
            const { data, expiration } = JSON.parse(cached);
            if (Date.now() > expiration) {
                localStorage.removeItem(key);
                return null;
            }
    
            return data;
        } catch (error) {
            console.error(`Error reading cache for key: ${key}`, error);
            return null;
        }
    };

    useEffect(() => {
        // Notify parent component of selection changes
        onSelectionChange(selectedOptions);
    }, [selectedOptions, onSelectionChange]);

    useEffect(() => {
        // Fetch options dynamically from the backend based on the filterType
        const fetchOptions = async () => {
            try {
                const cacheKey = `${filterType}_options_cache`;
                const cachedOptions = localStorage.getItem(cacheKey);

                if (cachedOptions) {
                    setOptions(JSON.parse(cachedOptions));
                } else {
                    const response = await axios.get(`${backendUrl}/api/filter/${filterType}`);
                    setOptions(response.data); // Expecting the backend to return an array of options
                    cacheWithExpiration(cacheKey, response.data, 3600000);
                }

            } catch (error) {
                console.error(`Error fetching ${filterType} options:`, error);
            }
        };

        fetchOptions();
    }, [filterType]);

    const toggleSelection = (option) => {
        setSelectedOptions((prev) => {
            const isSelected = prev.includes(option);
            if (isSelected && prev.length === prev.filter((item) => item !== option).length) {
                return prev; // No change
            }
    
            const newSelection = isSelected
                ? prev.filter((item) => item !== option)
                : [...prev, option];
    
            localStorage.setItem(`${filterType}_selected`, JSON.stringify(newSelection));
            return newSelection;
        });
    };
    

    const clearSelection = () => {
        setSelectedOptions([]);
        localStorage.removeItem(`${filterType}_selected`); // Clear localStorage
        onClear(); // Notify parent that the filter is cleared
    };

    return (
        <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-64">
            <h3 className="text-lg font-bold dark:text-white capitalize">
                {filterType}
            </h3>
            <div className="max-h-40 overflow-y-auto mt-2 space-y-2">
                {options.map((option) => (
                    <div
                        key={option}
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${selectedOptions.includes(option)
                            ? "bg-indigo-600 text-white"
                            : "dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        onClick={() => toggleSelection(option)}
                    >
                        <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={() => toggleSelection(option)}
                            className="cursor-pointer"
                        />
                        <span>{option}</span>
                    </div>
                ))}
            </div>
            {/* Clear Button */}
            <button
                onClick={clearSelection}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md w-full font-semibold"
            >
                Clear
            </button>
        </div>
    );
};

export default SelectableFilter;
