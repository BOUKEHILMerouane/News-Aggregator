import React from "react";

const AuthButtons = () => {
  return (
    <div className="space-x-4 hidden md:flex">
      {/* Sign Up Button (hidden on mobile) */}
      <button className="hover:text-indigo-200">Sign Up</button>
      
      {/* Log In Button */}
      <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-200 font-semibold">
        Log In
      </button>
    </div>
  );
};

export default AuthButtons;
