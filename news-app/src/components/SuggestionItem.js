import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const SuggestionItem = ({ imageUrl, title, onClick }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkMode = localStorage.getItem("darkMode") === "true";
        setIsDarkMode(darkMode);
    }, []);

    const decodeHTML = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
      };
      
    const processContent = (content) => {
        const decodedContent = decodeHTML(content);
        return decodedContent
            .replace(/<\/?[^>]+(>|$)/g, "") 
            .replace(/\[\+\d+\schars\]/g, "");
    };


    return (
        <div
            className={`flex items-center p-3 rounded-lg shadow-md transition-all cursor-pointer ${isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-white hover:bg-gray-200 text-black"
                }`}
            style={{
                marginBottom: "0.5rem",
            }}
            onClick={onClick}
        >
            <img
                src={imageUrl || "/images/news-fallback.jpg"}
                alt={title || "Suggestion Thumbnail"}
                className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-300"
            />
            <span className="text-base font-medium">{processContent(title) || "Untitled"}</span>
        </div>
    );
};

SuggestionItem.propTypes = {
    imageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default SuggestionItem;
