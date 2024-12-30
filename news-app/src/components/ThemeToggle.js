import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check the initial theme preference when the component loads
  useEffect(() => {
    const darkModeSetting = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkModeSetting);
    if (darkModeSetting) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Update the theme on the root element
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save the theme preference in localStorage
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
    >
      <div className="relative inline-block w-12 h-5">
        {/* Sun Icon for Light Mode (left side) */}
        <i
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 text-yellow-500 transition-all duration-300 text-sm ${
            isDarkMode ? "opacity-0" : "opacity-100"
          }`}
        >
          <i className="fas fa-sun"></i>
        </i>

        {/* Moon Icon for Dark Mode (right side) */}
        <i
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-300 transition-all duration-300 text-sm ${
            isDarkMode ? "opacity-100" : "opacity-0"
          }`}
        >
          <i className="fas fa-moon"></i>
        </i>

        {/* Switch Button (Slider) */}
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${
            isDarkMode ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
