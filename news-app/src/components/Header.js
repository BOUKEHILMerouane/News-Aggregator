import React, { useState, useEffect } from "react";
import MenuToggle from "./MenuToggle";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu"

const Header = ({ onSuggestionClick, onSearchClick, onUpdatePreferences, onOpenModal, user, onLogin, onLogout }) => {
    const [isVisible, setIsVisible] = useState(true); // Track header visibility
    const [lastScrollY, setLastScrollY] = useState(0); // Track last scroll position

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down and past 100px
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [lastScrollY]);
    return (
        <header className={`bg-red-600 text-black shadow-lg sticky top-0 w-full z-50 border-b border-red-700 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
            }`}>
            {/* Top Row: Logo/MenuToggle, SearchBar, and Auth Buttons */}
            <div className="flex items-center justify-between px-4 py-3">
                {/* Left Section: Menu and Logo */}
                <div className="flex items-center space-x-4">
                    <MenuToggle onUpdatePreferences={onUpdatePreferences} isLoggedIn={!!user}/>
                    <Logo />
                </div>

                {/* Center Section: SearchBar (Desktop Only) */}
                <div className="hidden md:flex md:flex-grow md:justify-center px-4 md:max-w-[600px] lg:max-w-[800px]">
                    <SearchBar
                        onSuggestionClick={onSuggestionClick}
                        onSearchClick={onSearchClick}
                        onClear={() => {
                            onSuggestionClick(null); // Clear suggested article
                            onSearchClick(null); // Clear search results
                        }}
                    />
                </div>

                {/* Right Section: Auth Buttons */}
                <div className="flex items-center space-x-1">
                    <ThemeToggle />
                    {user ? (
                        <UserMenu user={user} onLogout={onLogout} />
                    ) : (
                        <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-500 font-semibold text-sm"
                            onClick={onOpenModal}>
                            Sign Up
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Only: SearchBar */}
            <div className="w-full mt-3 px-4 md:hidden mb-4">
                <SearchBar
                    onSuggestionClick={onSuggestionClick}
                    onSearchClick={onSearchClick}
                    onClear={() => {
                        onSuggestionClick(null); // Clear suggested article
                        onSearchClick(null); // Clear search results
                    }}
                />
            </div>
        </header>
    );
};

export default Header;
