import React, { useState, useEffect, useRef } from "react";

const SidePanel = ({ onToggle, isOpen, onUpdatePreferences, isLoggedIn }) => {
    const [activeSection, setActiveSection] = useState(null); 
    const [options, setOptions] = useState([]);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
    const [selectedOptions, setSelectedOptions] = useState(
        JSON.parse(localStorage.getItem("selected_options")) || {}
    ); // Selected options for all sections
    const [loading, setLoading] = useState(false);

    const cache = useRef({}); // Cache for fetched results

    // Fetch options from the API based on the preference type
    const fetchOptions = async (preferenceType) => {
        if (cache.current[preferenceType]) {
            setOptions(cache.current[preferenceType]); // Use cached results if available
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/preference/${preferenceType}`);
            const data = await response.json();
            cache.current[preferenceType] = data; // Cache the results
            setOptions(data); // Update options with the API response
        } catch (error) {
            console.error(`Error fetching ${preferenceType} options:`, error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user preferences if logged in
    const fetchUserPreferences = async () => {
        const token = localStorage.getItem("token"); // Fetch the token stored during login
        console.log("token : "+token)
        if (!token) {
           // console.error("User is not authenticated.");
            return;
        }
    
        try {
            const response = await fetch(`${backendUrl}/api/preferences`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`, // Include Bearer token for authentication
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                setSelectedOptions(data.preferences); // Use the `preferences` field from response
                localStorage.setItem("selected_options", JSON.stringify(data.preferences));
                onUpdatePreferences(data.preferences);
            } else {
                console.error("Failed to fetch user preferences:", response.status);
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error);
        }
    };
    

    // Save preferences to the backend
    const savePreferences = async (preferences) => {
        const token = localStorage.getItem("token"); // Assuming the token is saved in localStorage
        if (!token) {
            return;
        }
    
        try {
            const response = await fetch("http://127.0.0.1:8000/api/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include the bearer token for authentication
                },
                body: JSON.stringify(preferences),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Preferences saved successfully:", data);
            } else {
                console.error("Failed to save preferences:", response.statusText);
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    };
    

    // Handle section toggle and fetch options when the section is activated
    const handleSectionToggle = (section) => {
        if (activeSection !== section) {
            fetchOptions(section); // Fetch data only when switching to a new section
        }
        setActiveSection((prev) => (prev === section ? null : section)); // Toggle section
    };

    // Handle option selection
    const toggleOption = (option) => {
        const updatedSelection = { ...selectedOptions };
        const currentSectionSelections = updatedSelection[activeSection] || [];

        if (currentSectionSelections.includes(option)) {
            updatedSelection[activeSection] = currentSectionSelections.filter(
                (selected) => selected !== option
            );
        } else {
            updatedSelection[activeSection] = [...currentSectionSelections, option];
        }

        setSelectedOptions(updatedSelection);
        localStorage.setItem("selected_options", JSON.stringify(updatedSelection)); // Save to localStorage

        onUpdatePreferences(updatedSelection);
        savePreferences(updatedSelection); // Save preferences to backend
    };

    // Clear all selections
    const clearAllSelections = () => {
        setSelectedOptions({});
        localStorage.removeItem("selected_options");
        onUpdatePreferences({});
        savePreferences({}); // Save cleared preferences to backend
    };

    // Render fetched options
    const renderChoices = () => {
        if (loading) {
            return <p className="text-white text-sm">Loading...</p>;
        }

        if (!options.length) {
            return <p className="text-white text-sm">No options available.</p>;
        }

        const currentSelections = selectedOptions[activeSection] || [];

        return (
            <div className="max-h-[300px] overflow-y-auto mt-2 space-y-1">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-md text-sm text-white flex items-center justify-between cursor-pointer ${currentSelections.includes(option)
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 hover:bg-red-700"
                            }`}
                        onClick={() => toggleOption(option)}
                    >
                        <span>{option}</span>
                        <input
                            type="checkbox"
                            checked={currentSelections.includes(option)}
                            readOnly
                            className="cursor-pointer"
                        />
                    </div>
                ))}
            </div>
        );
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserPreferences(); 
        } else {
            if (localStorage.getItem("token")){
                clearAllSelections(); 
            }
            else{
                fetchUserPreferences(); 
            }
        }
    }, [isLoggedIn]);

    return (
        <div
            className={`fixed inset-y-0 left-0 bg-gray-800 shadow-lg transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 z-50 w-[250px]`
            }
            style={{ height: '100vh' }}
        >
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Preferences</h2>

                </div>

                {/* Sources Section */}
                <div className="mt-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleSectionToggle("sources")}
                    >
                        <span className="font-medium text-gray-300">Sources</span>
                        <i
                            className={`fas fa-chevron-${activeSection === "sources" ? "up" : "down"
                                } text-white transition-transform duration-300`}
                        ></i>
                    </div>
                    <div
                        className={`transition-all duration-300 ${activeSection === "sources" ? "max-h-[300px]" : "max-h-0 overflow-hidden"
                            }`}
                    >
                        {renderChoices()}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="mt-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleSectionToggle("categories")}
                    >
                        <span className="font-medium text-white">Categories</span>
                        <i
                            className={`fas fa-chevron-${activeSection === "categories" ? "up" : "down"
                                } text-white transition-transform duration-300`}
                        ></i>
                    </div>
                    <div
                        className={`transition-all duration-300 ${activeSection === "categories" ? "max-h-[300px]" : "max-h-0 overflow-hidden"
                            }`}
                    >
                        {renderChoices()}
                    </div>
                </div>

                {/* Authors Section */}
                <div className="mt-4">
                    <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => handleSectionToggle("authors")}
                    >
                        <span className="font-medium text-white">Authors</span>
                        <i
                            className={`fas fa-chevron-${activeSection === "authors" ? "up" : "down"
                                } text-white transition-transform duration-300`}
                        ></i>
                    </div>
                    <div
                        className={`transition-all duration-300 ${activeSection === "authors" ? "max-h-[300px]" : "max-h-0 overflow-hidden"
                            }`}
                    >
                        {renderChoices()}
                    </div>
                </div>
            </div>

            {/* Clear All Button */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={clearAllSelections}
                    className="flex items-center text-white border border-white hover:bg-white hover:text-gray-200 text-sm space-x-2 rounded-md px-4 py-2"
                >
                    <i className="fas fa-trash-alt"></i>
                    <span>Clear All</span>
                </button>
            </div>

            {/* Close Button */}
            <button
                onClick={onToggle}
                className="absolute top-4 right-4 text-white"
            >
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export default SidePanel;
