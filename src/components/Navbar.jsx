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
      
      <nav className="bg-[#131921] text-white py-5 px-4">
        <div className="max-w-[95rem] mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo / Site Name */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Link to="/" className="text-2xl font-semibold hover:text-yellow-400">
              InkBound
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-[40%] relative">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                className="w-full px-4 py-2 rounded-l-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                ref={searchInputRef}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              />
              <button
                onClick={handleSearch}
                className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-r-md hover:bg-yellow-300 flex items-center justify-center"
              >
                <FaSearch />
              </button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.type}-${suggestion.text}-${index}`}
                      className={`p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 flex items-center space-x-3 ${
                        selectedSuggestion === index ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.type === 'book' && suggestion.image && (
                        <img 
                          src={suggestion.image.startsWith('http') ? suggestion.image : `http://localhost:3000/${suggestion.image}`}
                          alt={suggestion.text}
                          className="w-8 h-10 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {suggestion.type === 'book' && <FaSearch className="text-gray-400 text-xs" />}
                          {suggestion.type === 'author' && <FaUser className="text-gray-400 text-xs" />}
                          {suggestion.type === 'genre' && <span className="text-gray-400 text-xs">#</span>}
                          <span className="text-gray-800 font-medium">{suggestion.text}</span>
                        </div>
                        {suggestion.subtext && (
                          <div className="text-xs text-gray-500 mt-1">{suggestion.subtext}</div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 capitalize">
                        {suggestion.type}
                      </div>
                    </div>
                  ))
                ) : searchTerm.length >= 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    No suggestions found for "{searchTerm}"
                  </div>
                ) : null}
                
                {/* Search for exact term option */}
                {searchTerm.length >= 2 && (
                  <div
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-t-2 border-gray-200 flex items-center space-x-3 ${
                      selectedSuggestion === suggestions.length ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
                    }`}
                    onClick={handleSearch}
                  >
                    <FaSearch className="text-yellow-600" />
                    <span className="text-gray-800">
                      Search for "<strong>{searchTerm}</strong>"
                    </span>
                  </div>
                )}
              </div>
            )}
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
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="mr-2" />
                        My Profile
                      </Link>
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
              {isAuthenticated ? (
                <Link to="/profile?tab=wishlist" className="hover:text-yellow-400">
                  <FaHeart />
                </Link>
              ) : (
                <FaHeart className="hover:text-yellow-400 cursor-pointer" onClick={() => setShowLogin(true)} />
              )}
              <div className="w-px h-4 bg-gray-400"></div>
              {isAuthenticated ? (
                <Link to="/profile?tab=cart" className="hover:text-yellow-400">
                  <FaShoppingCart />
                </Link>
              ) : (
                <FaShoppingCart className="hover:text-yellow-400 cursor-pointer" onClick={() => setShowLogin(true)} />
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
