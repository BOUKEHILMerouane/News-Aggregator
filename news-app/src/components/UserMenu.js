import React, { useState } from "react";

const UserMenu = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout(); // Call the parent-provided logout handler
    setMenuOpen(false); // Close the menu
    localStorage.removeItem("token")
  };

  return (
    <div className="relative inline-block text-left z-50">
      {/* User Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-2 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <img
          src={"/images/user.jpg"} 
          alt="User"
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm font-medium dark:text-white hidden sm:inline"> {/* Hides username on smaller screens */}
          {user.username}
        </span>
        <i
          className={`fas fa-chevron-down text-gray-500 dark:text-gray-300 transition-transform ${
            menuOpen ? "rotate-180" : "rotate-0"
          }`}
        ></i>
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-1 w-20 bg-white dark:bg-gray-700 rounded-lg shadow-lg sm:w-28"> 
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-red-400 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
