// src/components/Navbar.jsx
import React from 'react';
import { FaUser, FaHeart, FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-[#131921] text-white py-5 px-4">
      <div className="max-w-[95rem] mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
        
          <span className="text-2xl font-semibold">InkBound</span>
        </div>

        {/* Center: Search Bar */}
        <div className="w-full md:w-[40%] flex items-center">
          <input
            type="text"
            placeholder="Search books, authors, genres..."
            className="w-full px-4 py-2 rounded-l-md text-gray-700 focus:outline-none"
          />
          <button className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-r-md hover:bg-yellow-300">
            Search
          </button>
        </div>

        {/* Right: Nav Links + Icons */}
        <div className="flex items-center space-x-6 md:ml-4">
          <div className="hidden md:flex space-x-6 font-medium">
            <a href="#" className="hover:text-yellow-400">Home</a>
            <a href="#" className="hover:text-yellow-400">Shop</a>
            <a href="#" className="hover:text-yellow-400">Blog</a>
            <a href="#" className="hover:text-yellow-400">Contact</a>
          </div>
          <div className="flex space-x-4 items-center text-lg">
            <FaUser className="hover:text-yellow-400 cursor-pointer" />
            <div className="w-px h-4 bg-gray-400"></div>
            <FaHeart className="hover:text-yellow-400 cursor-pointer" />
            <div className="w-px h-4 bg-gray-400"></div>
            <FaShoppingCart className="hover:text-yellow-400 cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
