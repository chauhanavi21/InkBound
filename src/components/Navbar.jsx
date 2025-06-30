// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaHeart, FaShoppingCart, FaCog, FaSignOutAlt, FaUserShield, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout, isAdmin, isAuthenticated, authMessage } = useAuth();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Load books and genres from database
  useEffect(() => {
    fetchBooksAndGenres();
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBooksAndGenres = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
        // Extract unique genres
        const uniqueGenres = [...new Set(data.map(book => book.genre).filter(Boolean))];
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error('Error fetching books for search:', error);
    }
  };

  const generateSuggestions = (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const suggestions = [];

    // Add matching book titles
    const titleMatches = books
      .filter(book => book.title.toLowerCase().includes(lowerTerm))
      .slice(0, 4)
      .map(book => ({
        type: 'book',
        text: book.title,
        subtext: `by ${book.author}`,
        id: book.id,
        image: book.image_path || book.images?.[0]
      }));

    // Add matching authors
    const authorMatches = [...new Set(books
      .filter(book => book.author.toLowerCase().includes(lowerTerm))
      .map(book => book.author))]
      .slice(0, 3)
      .map(author => ({
        type: 'author',
        text: author,
        subtext: 'Author'
      }));

    // Add matching genres
    const genreMatches = genres
      .filter(genre => genre.toLowerCase().includes(lowerTerm))
      .slice(0, 2)
      .map(genre => ({
        type: 'genre',
        text: genre,
        subtext: 'Category'
      }));

    // Combine and limit total suggestions
    suggestions.push(...titleMatches, ...authorMatches, ...genreMatches);
    setSuggestions(suggestions.slice(0, 8));
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestion(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      setIsLoading(true);
      setShowSuggestions(true);
      
      // Debounce suggestions generation
      debounceRef.current = setTimeout(() => {
        generateSuggestions(value);
        setIsLoading(false);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || (suggestions.length === 0 && searchTerm.length < 2)) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    const totalOptions = suggestions.length + (searchTerm.length >= 2 ? 1 : 0); // +1 for "Search for..." option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < totalOptions - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestion]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    
    switch (suggestion.type) {
      case 'book':
        navigate(`/product/${suggestion.id}`);
        break;
      case 'author':
        setSearchTerm(suggestion.text);
        navigate(`/shop?search=${suggestion.text}`);
        break;
      case 'genre':
        setSearchTerm(suggestion.text);
        navigate(`/shop?category=${suggestion.text}`);
        break;
    }
  };

  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    setShowSuggestions(false);
    setSelectedSuggestion(-1);

    if (!term) return;

    // Check for exact title match
    const titleMatch = books.find(book => 
      book.title.toLowerCase() === term
    );
    if (titleMatch) {
      navigate(`/product/${titleMatch.id}`);
      return;
    }

    // Check for exact author match
    const authorMatch = books.find(book => 
      book.author.toLowerCase() === term
    );
    if (authorMatch) {
      navigate(`/product/${authorMatch.id}`);
      return;
    }

    // Check for genre match
    const genreMatch = genres.find(genre => 
      genre.toLowerCase() === term
    );
    if (genreMatch) {
      navigate(`/shop?category=${genreMatch}`);
      return;
    }

    // For partial matches or general search, go to shop page with search query
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
      {/* Auth Message Bar */}
      {authMessage && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm">
          {authMessage}
        </div>
      )}
      
      <nav className="bg-[#131921] text-white py-4 px-4 shadow-lg">
        <div className="max-w-[95rem] mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo / Site Name */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Link to="/" className="text-2xl font-bold hover:text-yellow-400 transition-colors duration-200">
              InkBound
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-[45%] relative">
            <div className="flex items-center shadow-md rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                className="w-full px-4 py-3 text-gray-800 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              />
              <button
                onClick={handleSearch}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 flex items-center justify-center transition-all duration-200"
              >
                <FaSearch className="text-lg" />
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto mt-1"
              >
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.type}-${suggestion.text}-${index}`}
                      className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 flex items-center space-x-4 transition-colors duration-150 ${
                        selectedSuggestion === index ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.type === 'book' && suggestion.image && (
                        <img 
                          src={suggestion.image.startsWith('http') ? suggestion.image : `http://localhost:3000/${suggestion.image}`}
                          alt={suggestion.text}
                          className="w-10 h-12 object-cover rounded shadow-sm flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {suggestion.type === 'book' && <FaSearch className="text-gray-400 text-sm flex-shrink-0" />}
                          {suggestion.type === 'author' && <FaUser className="text-gray-400 text-sm flex-shrink-0" />}
                          {suggestion.type === 'genre' && <span className="text-gray-400 text-sm flex-shrink-0">#</span>}
                          <span className="text-gray-900 font-medium text-sm truncate">{suggestion.text}</span>
                        </div>
                        {suggestion.subtext && (
                          <div className="text-xs text-gray-500 truncate">{suggestion.subtext}</div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">
                        {suggestion.type}
                      </div>
                    </div>
                  ))
                ) : searchTerm.length >= 2 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-sm">No suggestions found for "<span className="font-medium">{searchTerm}</span>"</div>
                  </div>
                ) : null}
                
                {/* Search for exact term option */}
                {searchTerm.length >= 2 && (
                  <div
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-t-2 border-gray-100 flex items-center space-x-3 transition-colors duration-150 ${
                      selectedSuggestion === suggestions.length ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
                    }`}
                    onClick={handleSearch}
                  >
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaSearch className="text-yellow-600 text-sm" />
                    </div>
                    <span className="text-gray-800 text-sm">
                      Search for "<span className="font-semibold">{searchTerm}</span>"
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation and Icons */}
          <div className="flex items-center space-x-6 md:ml-4">
            <div className="hidden md:flex space-x-6 font-medium">
              <Link to="/" className="hover:text-yellow-400 transition-colors duration-200 py-2">Home</Link>
              <Link to="/shop" className="hover:text-yellow-400 transition-colors duration-200 py-2">Shop</Link>
              <Link to="/blog" className="hover:text-yellow-400 transition-colors duration-200 py-2">Blog</Link>
              <Link to="/contact" className="hover:text-yellow-400 transition-colors duration-200 py-2">Contact</Link>
              {isAdmin() && (
                <Link to="/admin" className="hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-1 py-2">
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
                    className="flex items-center space-x-2 hover:text-yellow-400 cursor-pointer transition-colors duration-200 py-2 px-2 rounded"
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-semibold text-gray-900">{user?.username}</div>
                        <div className="text-xs text-gray-500 mt-1">{user?.email}</div>
                        <div className="mt-2">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            isAdmin() 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="mr-3" />
                        My Profile
                      </Link>
                      {isAdmin() && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaCog className="mr-3" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-150"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-authenticated User */
                <button
                  onClick={() => setShowLogin(true)}
                  className="hover:text-yellow-400 cursor-pointer flex items-center space-x-1 transition-colors duration-200 py-2 px-2 rounded"
                >
                  <FaUser />
                  <span className="hidden md:inline text-sm font-medium">Sign In</span>
                </button>
              )}
              
              <div className="w-px h-6 bg-gray-400 opacity-50"></div>
              {isAuthenticated ? (
                <Link to="/profile?tab=wishlist" className="hover:text-yellow-400 transition-colors duration-200 p-2 rounded">
                  <FaHeart />
                </Link>
              ) : (
                <FaHeart className="hover:text-yellow-400 cursor-pointer transition-colors duration-200 p-2 rounded" onClick={() => setShowLogin(true)} />
              )}
              <div className="w-px h-6 bg-gray-400 opacity-50"></div>
              {isAuthenticated ? (
                <Link to="/profile?tab=cart" className="hover:text-yellow-400 transition-colors duration-200 p-2 rounded">
                  <FaShoppingCart />
                </Link>
              ) : (
                <FaShoppingCart className="hover:text-yellow-400 cursor-pointer transition-colors duration-200 p-2 rounded" onClick={() => setShowLogin(true)} />
              )}
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
