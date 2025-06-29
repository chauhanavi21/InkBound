// src/components/Navbar.jsx
import React, { useState } from 'react';
import { FaUser, FaHeart, FaShoppingCart, FaCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import books from '../data/books';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const genres = ['Fiction', 'Romance', 'Thriller', 'Non-Fiction']; // Update if needed

  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return;

    // Check for title match
    const titleMatch = books.find(book => book.title.toLowerCase() === term);
    if (titleMatch) {
      navigate(`/product/${titleMatch.id}`);
      return;
    }

    // Check for author match
    const authorMatch = books.find(book => book.author.toLowerCase() === term);
    if (authorMatch) {
      navigate(`/product/${authorMatch.id}`);
      return;
    }

    // Check for genre match
    const genreMatch = genres.find(genre => genre.toLowerCase() === term);
    if (genreMatch) {
      navigate(`/shop?category=${genreMatch}`);
      return;
    }

    // Fallback to ShoppingPage with similar results
    navigate(`/shop?search=${term}`);
  };

  return (
    <nav className="bg-[#131921] text-white py-5 px-4">
      <div className="max-w-[95rem] mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Logo / Site Name */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Link to="/" className="text-2xl font-semibold hover:text-yellow-400">
            InkBound
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-[40%] flex items-center">
          <input
            type="text"
            placeholder="Search books, authors, genres..."
            className="w-full px-4 py-2 rounded-l-md text-gray-700 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-r-md hover:bg-yellow-300"
          >
            Search
          </button>
        </div>

        {/* Navigation and Icons */}
        <div className="flex items-center space-x-6 md:ml-4">
          <div className="hidden md:flex space-x-6 font-medium">
            <Link to="/" className="hover:text-yellow-400">Home</Link>
            <Link to="/shop" className="hover:text-yellow-400">Shop</Link>
            <Link to="/blog" className="hover:text-yellow-400">Blog</Link>
            <Link to="/contact" className="hover:text-yellow-400">Contact</Link>
            <Link to="/admin" className="hover:text-yellow-400 flex items-center space-x-1">
              <FaCog className="text-sm" />
              <span>Admin</span>
            </Link>
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
