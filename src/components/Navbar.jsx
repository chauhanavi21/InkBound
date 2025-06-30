import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHeart, FaShoppingCart, FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!search.trim()) return;

    const searchTerm = search.toLowerCase();

    // Try to match exact title or author
    const bookData = require('../data/books').default;
    const exactBook = bookData.find(
      (b) =>
        b.title.toLowerCase() === searchTerm ||
        b.author.toLowerCase() === searchTerm
    );

    if (exactBook) {
      navigate(`/product/${exactBook.id}`);
    } else {
      navigate(`/shop?q=${searchTerm}`);
    }

    setSearch('');
    setMobileSearchOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <nav className="bg-[#131921] text-white py-5 px-4 relative z-50">
      <div className="max-w-[95rem] mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Left: Logo */}
        <div className="flex items-center space-x-3">
          <span
            className="text-2xl font-semibold cursor-pointer"
            onClick={() => navigate('/')}
          >
            InkBound
          </span>
        </div>

        {/* Center: Search Bar - visible only on md+ screens */}
        <div className="hidden md:flex w-full md:w-[40%] items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors, genres..."
            className="w-full px-4 py-2 rounded-l-md text-gray-700 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-r-md hover:bg-yellow-300"
          >
            Search
          </button>
        </div>

        {/* Right: Nav Links + Icons */}
        <div className="flex items-center space-x-6">
          {/* Links for large screens */}
          <div className="hidden md:flex space-x-6 font-medium">
            <span onClick={() => navigate('/')} className="hover:text-yellow-400 cursor-pointer">Home</span>
            <span onClick={() => navigate('/shop')} className="hover:text-yellow-400 cursor-pointer">Shop</span>
            <span onClick={() => navigate('/blog')} className="hover:text-yellow-400 cursor-pointer">Blog</span>
            <span onClick={() => navigate('/contact')} className="hover:text-yellow-400 cursor-pointer">Contact</span>
          </div>

          {/* Icons */}
          <div className="flex space-x-4 items-center text-lg">
            {/* Mobile Search Icon */}
            <FaSearch
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden hover:text-yellow-400 cursor-pointer"
            />
            <FaUser className="hover:text-yellow-400 cursor-pointer" />
            <FaHeart className="hover:text-yellow-400 cursor-pointer" />
            <FaShoppingCart className="hover:text-yellow-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (below navbar) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 mt-3">
          <div className="flex items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search books, authors, genres..."
              className="w-full px-4 py-2 rounded-l-md text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-r-md hover:bg-yellow-300"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
