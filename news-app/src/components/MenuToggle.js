import React, { useState } from "react";
import SidePanel from "./SidePanel";

const MenuToggle = ({ onUpdatePreferences, isLoggedIn  }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };



  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="text-xl"
      >


        <i className="fas fa-bars text-white"></i>

      </button>
      {/* Side Panel */}
      <SidePanel
        onToggle={toggleMenu}
        isOpen={isOpen}
        onUpdatePreferences={onUpdatePreferences}
        isLoggedIn={isLoggedIn} />
    </div>
  );
};

export default MenuToggle;
