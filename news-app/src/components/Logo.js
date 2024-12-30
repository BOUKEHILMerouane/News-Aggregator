import React, { useState, useEffect } from "react";

const Logo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled on initial load
    const darkModeSetting = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkModeSetting);

    // Set the initial theme based on saved preference
    if (darkModeSetting) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Listener to detect theme changes
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    // Add event listener to listen for theme change events
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', handleThemeChange);

    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', handleThemeChange);
    };
  }, []);

  return (
    <img
      src={"/images/logo.png"}
      alt="Logo"
      className="w-32 h-10 md:w-32 md:h-10" // Add your custom size
    />
  );
};

export default Logo;
