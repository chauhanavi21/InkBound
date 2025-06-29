// src/components/Navbar.jsx
import React, { useState } from 'react';
import { FaUser, FaHeart, FaShoppingCart, FaCog, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';
import books from '../data/books';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();

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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const switchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const switchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  return (
    <>
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
              {isAdmin() && (
                <Link to="/admin" className="hover:text-yellow-400 flex items-center space-x-1">
                  <FaCog className="text-sm" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
            
            <div className="flex space-x-4 items-center text-lg">
              {isAuthenticated ? (
                /* Authenticated User Menu */
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:text-yellow-400 cursor-pointer"
                  >
                    {isAdmin() ? (
                      <FaUserShield className="text-yellow-400" />
                    ) : (
                      <FaUser />
                    )}
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.username}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.username}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                        <div className="text-xs">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            isAdmin() 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog className="mr-2" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-authenticated User */
                <button
                  onClick={() => setShowLogin(true)}
                  className="hover:text-yellow-400 cursor-pointer flex items-center space-x-1"
                >
                  <FaUser />
                  <span className="hidden md:inline text-sm font-medium">Sign In</span>
                </button>
              )}
              
              <div className="w-px h-4 bg-gray-400"></div>
              <FaHeart className="hover:text-yellow-400 cursor-pointer" />
              <div className="w-px h-4 bg-gray-400"></div>
              <FaShoppingCart className="hover:text-yellow-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={switchToSignup}
        />
      )}
      
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
};

export default Navbar;
