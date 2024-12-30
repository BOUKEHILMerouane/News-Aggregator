import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import NewsFlex from './components/NewsFlex';
import AuthModal from './components/AuthModal';

function App() {
  const [suggestedArticle, setSuggestedArticle] = useState(null);
  const [searchResults, setSearchResults] = useState(null); // Store search results
  const [isModalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    
    

    if (userId && username) {
      setUser({ id: userId, username }); // Set user state from sessionStorage
    }
  }, []);

  const handleLogin = (userData) => {
    // Save user data to sessionStorage
    sessionStorage.setItem("userId", userData.id);
    sessionStorage.setItem("username", userData.username);

    // Set user state
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear sessionStorage
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");

    // Clear user state
    setUser(null);
  };

  const [preferences, setPreferences] = useState(() => {
    // Load preferences from localStorage or default to an empty object
    const savedPreferences = localStorage.getItem("selected_options");
    return savedPreferences ? JSON.parse(savedPreferences) : {};
  });

  const handleUpdatePreferences = (updatedPreferences) => {
    setPreferences(updatedPreferences);
    // Save the updated preferences to localStorage
    localStorage.setItem("selected_options", JSON.stringify(updatedPreferences));
  };


  return (
    <div className="App dark:bg-gray-800 h-full">
      <Header
        onSuggestionClick={(article) => {
          setSuggestedArticle(article); // Set the clicked suggestion
          setSearchResults(null); // Clear search results
        }}
        onSearchClick={(results) => {
          setSearchResults(results); // Set search results
          setSuggestedArticle(null); // Clear suggested article
        }}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenModal={() => setModalOpen(true)} // Pass modal toggle handler to Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className={`p-3 transition-all ${isModalOpen ? 'blur-md' : ''}`}>
        <NewsFlex
          suggestedArticle={suggestedArticle}
          searchResults={searchResults}
          preferences={preferences}
        />
      </main>
      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} handleLogin={handleLogin}/>
    </div>
  );
}

export default App;
