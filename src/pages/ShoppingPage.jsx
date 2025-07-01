// src/pages/ShoppingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import staticBooks from '../data/books';
import BookCard from '../components/BookCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const priceRanges = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 to $200', min: 50, max: 200 },
  { label: '$200 to $500', min: 200, max: 500 },
  { label: '$500 & Above', min: 500, max: Infinity },
];

const parsePrice = (price) => {
  if (typeof price === 'string') {
    return parseFloat(price.replace('$', '').replace(',', '')) || 0;
  }
  return price;
};

const ShoppingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search parameters from URL
  const urlParams = new URLSearchParams(location.search);
  const searchParam = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(
    categoryParam ? [categoryParam] : []
  );
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParam);

  // Dynamically generate categories from the loaded book data
  const availableCategories = React.useMemo(() => {
    const uniqueCategories = [...new Set(
      books
        .map(book => book.genre || book.category)
        .filter(Boolean)
    )].sort();
    console.log('Available categories from data:', uniqueCategories);
    return uniqueCategories;
  }, [books]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        // Filter only books that are on sale
        setBooks(data.filter(book => book.on_sale));
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('Error fetching books, using static data:', error);
      // Fallback to static data if API fails
      setBooks(staticBooks);
      console.log('Loaded static books:', staticBooks.length, 'books');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (range) => {
    setSelectedPrice(range);
  };

  // Helper function to normalize author names for better matching
  const normalizeAuthorName = (name) => {
    return name
      .toLowerCase()
      .replace(/\./g, '') // Remove periods
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  };

  const filteredBooks = books.filter((book) => {
    const price = parsePrice(book.price);
    const bookCategory = book.genre || book.category;
    
    // Handle books without categories - they should show when no category filter is selected
    const matchCategory = selectedCategories.length === 0 || 
                         (bookCategory && selectedCategories.includes(bookCategory));
    
    const matchPrice = !selectedPrice || (price >= selectedPrice.min && price <= selectedPrice.max);

    // Add text search functionality with improved author name matching
    const matchSearch = !searchTerm || (() => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const normalizedSearchTerm = normalizeAuthorName(searchTerm);
      
      return (
        book.title.toLowerCase().includes(lowerSearchTerm) ||
        book.author.toLowerCase().includes(lowerSearchTerm) ||
        normalizeAuthorName(book.author).includes(normalizedSearchTerm) ||
        (book.description && book.description.toLowerCase().includes(lowerSearchTerm)) ||
        (book.genre && book.genre.toLowerCase().includes(lowerSearchTerm))
      );
    })();

    return matchCategory && matchPrice && matchSearch;
  });

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBooks}
              className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-[96rem] mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">All Books ({filteredBooks.length})</h2>
          {searchTerm && (
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700">
                Searching for: <strong>"{searchTerm}"</strong>
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  navigate('/shop');
                }}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[19%] bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-bold mb-4">Filters</h3>

            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Category</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <div key={cat}>
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                      />
                      {cat}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs">Loading categories...</div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Price Range</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {priceRanges.map((range) => (
                  <div key={range.label}>
                    <input
                      type="radio"
                      name="price"
                      className="mr-2"
                      checked={selectedPrice?.label === range.label}
                      onChange={() => handlePriceChange(range)}
                    />
                    {range.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedPrice(null);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear All Filters
            </button>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-[81%]">
            {filteredBooks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No books match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingPage;
