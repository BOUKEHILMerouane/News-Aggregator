import React, { useState, useEffect, useRef } from "react";

// Helper function to sanitize the title for a valid ID
const sanitizeTitle = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "-");
};

// Helper function to decode HTML entities
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Helper function to process text content
const processContent = (content) => {
  const decodedContent = decodeHTML(content);
  return decodedContent
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\[\+\d+\schars\]/g, "");
};

// Helper function to extract domain from a URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", ""); // Remove 'www.' if present
  } catch {
    return url; // Fallback to the URL if parsing fails
  }
};

// Helper function to check if created_at is within an hour
const isNewArticle = (created_at) => {
  const now = new Date();
  const createdDate = new Date(created_at); // Parse ISO 8601 format
  const diffInMinutes = (now - createdDate) / (1000 * 60); // Convert ms to minutes
  return diffInMinutes <= 60; // Check if the difference is 60 minutes or less
};

// Helper function to format date for user
const formatDateForUser = (isoDate) => {
  const date = new Date(isoDate);
  const options = {
    year: "numeric",
    month: "long", // e.g., "December"
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
};

const NewsCard = ({ image, title, created_at, content, category, source, author }) => {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const fallbackImage = "/images/news-fallback.jpg";
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // Check if dark mode is active
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImageLoaded(true); // Load the image when in the viewport
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <article
      ref={cardRef}
      id={`card-${sanitizeTitle(title)}`}
      className="max-w-2xl mx-auto my-8 rounded-lg overflow-hidden shadow-lg transform transition-all hover:scale-105 
        dark:bg-gray-900"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(px)",

      }}
    >
      {/* Card Header */}
      <div
        className={`h-48 bg-cover bg-center relative ${!isImageLoaded ? "bg-gray-300" : ""}`}
        style={{
          backgroundImage: isImageLoaded ? `url(${image || fallbackImage})` : "none",
        }}
      >
        {/* Category */}
        {category && (
          <h4 className="absolute bottom-0 left-0 text-white text-xs font-medium bg-black bg-opacity-70 px-2 py-1 rounded-tr-lg">
            {category}
          </h4>
        )}

        {/* New Label */}
        {isNewArticle(created_at) && (
          <div className="absolute top-0 left-0 bg-red-600 bg-opacity-90 text-white text-xs font-bold px-3 py-1 rounded-br-lg shadow-md">
            New
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 text-left">
        {/* Title */}
        <h2 className="text-lg font-bold mb-2 tracking-wide leading-tight">{decodeHTML(title)}</h2>

        {/* Content */}
        <p className="text-sm leading-relaxed text-gray-700 dark:text-white mb-4">
          {processContent(content).slice(0, 120)}...
        </p>

        {/* Footer Information */}
        <div className="mt-2 text-xs space-y-1">
          <p>
            <span className="font-semibold">Source:</span>{" "}
            {source ? (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >

                {extractDomain(source)}
              </a>
            ) : (
              "Unknown"
            )}
          </p>
          <p>
            <span className="font-semibold">Author:</span> {author || "Unknown"}
          </p>
          <p>
            <span className="font-semibold">Published At:</span>{" "}
            {formatDateForUser(created_at)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
