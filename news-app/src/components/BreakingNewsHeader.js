import React, { useState } from "react";
import SelectableFilter from "./SelectableFilter";
import DateSelector from "./DateSelector";

const BreakingNewsHeader = ({
    searchResults,
    toggleFilters,
    clearFilters,
    updateCategories,
    updateSources,
    updateDateRange,
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

    const handleToggleFilters = () => {
        setShowFilters(!showFilters);
        toggleFilters(); // Notify parent to toggle filters
    };

    const toggleActiveFilter = (filterType) => {
        setActiveFilter((prev) => (prev === filterType ? null : filterType));
    };

    const handleDateChange = (key, value) => {
        const updatedRange = { ...dateRange, [key]: value };
        setDateRange(updatedRange);
        updateDateRange(key, value);
    };

    const handleClearDates = () => {
        setDateRange({ startDate: "", endDate: "" });
        updateDateRange("start", "");
        updateDateRange("end", "");
    };

    const isSearchPerformed = Boolean(searchResults);

    return (
        <div className="dark:bg-gray-800 dark:text-white">
            {/* Header Section */}
            <div className="flex flex-col items-start space-y-4">
                {/* Breaking News / Searched News */}
                <h1 className="text-4xl font-bold">
                    {isSearchPerformed ? (
                        <>
                            <span className="text-red-600">Searched</span>{" "}
                            <span
                                className="text-black dark:text-white"
                            >
                                News
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-red-600">Breaking</span>{" "}
                            <span
                                className="text-black dark:text-white"
                            >
                                News
                            </span>
                        </>
                    )}
                </h1>

                {/* Filters Button */}
                <button
                    onClick={handleToggleFilters}
                    className="flex items-center space-x-2 text-base font-medium hover:text-indigo-600 transition"
                >
                    <span>Filters</span>
                    <i className={`fas ${showFilters ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="flex flex-col items-center space-y-6 mt-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full sm:w-3/4 lg:w-2/3 mx-auto">
                    <div className="flex justify-center items-center space-x-1 sm:space-x-16">
                        {/* Date Filter */}
                        <button
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${activeFilter === "date" ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                                } hover:bg-red-600 hover:text-white transition`}
                            onClick={() => toggleActiveFilter("date")}
                        >
                            <span>Date</span>
                            <i
                                className={`fas ${activeFilter === "date"
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                    }`}
                            ></i>
                        </button>

                        {/* Category Filter */}
                        <button
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${activeFilter === "categories"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                                } hover:bg-red-600 hover:text-white transition`}
                            onClick={() => toggleActiveFilter("categories")}
                        >
                            <span>Category</span>
                            <i
                                className={`fas ${activeFilter === "categories"
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                    }`}
                            ></i>
                        </button>

                        {/* Source Filter */}
                        <button
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${activeFilter === "sources"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                                } hover:bg-red-600 hover:text-white transition`}
                            onClick={() => toggleActiveFilter("sources")}
                        >
                            <span>Source</span>
                            <i
                                className={`fas ${activeFilter === "sources"
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                    }`}
                            ></i>
                        </button>
                    </div>

                    {/* Render Active Filter Component */}
                    {activeFilter === "date" && (
                        <DateSelector
                            onDateChange={handleDateChange}
                            onClear={handleClearDates}
                        />
                    )}

                    {activeFilter === "categories" && (
                        <SelectableFilter
                            filterType="categories"
                            onSelectionChange={(selection) => {
                                localStorage.setItem(
                                    "categories_selected",
                                    JSON.stringify(selection)
                                );
                                updateCategories(selection);
                            }}
                            onClear={() => {
                                localStorage.removeItem("categories_selected");
                                updateCategories([]);
                            }}
                        />
                    )}

                    {activeFilter === "sources" && (
                        <SelectableFilter
                            filterType="sources"
                            onSelectionChange={(selection) => {
                                localStorage.setItem(
                                    "sources_selected",
                                    JSON.stringify(selection)
                                );
                                updateSources(selection);
                            }}
                            onClear={() => {
                                localStorage.removeItem("sources_selected");
                                updateSources([]);
                            }}
                        />
                    )}

                    {/* Clear Button */}
                    <button
                        onClick={clearFilters}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-full text-sm font-semibold shadow-md transition"
                    >
                        <i className="fas fa-times"></i>
                        <span>Clear</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BreakingNewsHeader;
