// src/components/FavouriteReads.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import staticBooks from '../data/books';

const FavouriteReads = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavouriteBooks();
  }, []);

  const fetchFavouriteBooks = async () => {
    try {
      // First try to get admin-selected editor's picks
      try {
        const featuredResponse = await fetch('http://localhost:3000/api/featured-content/editors_picks');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData && featuredData.length > 0) {
            setBooks(featuredData.slice(0, 6));
            setLoading(false);
            return;
          }
        }
      } catch (featuredError) {
        console.log('No admin-selected editor\'s picks, using automatic selection');
      }

      // Fallback to automatic selection
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        // Get books with high ratings or on sale, limit to 6
        const favouriteBooks = data
          .filter(book => book.on_sale && (book.condition_rating >= 8 || book.price <= 100))
          .slice(0, 6);
        setBooks(favouriteBooks);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('❌ Error fetching favourite books from database:', error);
      console.log('⚠️ Database not available - please start backend server with "npm start"');
      // Show empty state instead of static fallback to maintain data consistency
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Our Favourite Reads</h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading favourite books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Favourite Reads</h2>
          <Link to="/shop" className="text-white bg-red-500 hover:bg-red-600 px-5 py-2 text-sm rounded-full">
            View All →
          </Link>
        </div>

        <div className="grid gap-y-10 gap-x-6 md:grid-cols-3">
          {books.map((book) => (
            <Link
              to={`/product/${book.id}`}
              key={book.id}
              className="flex items-start space-x-4 hover:opacity-90 transition relative"
            >
              {/* Discount Badge - Subtle overlay on book cover */}
              {book.is_discount_active && book.discount_percentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                  -{book.discount_percentage}%
                </div>
              )}
              <img
                src={book.img || (book.image_path ? `http://localhost:3000/${book.image_path}` : (book.images && book.images[0] ? `http://localhost:3000/${book.images[0]}` : '/assets/book1.jpg'))}
                alt={book.title}
                className="w-24 h-32 object-cover rounded shadow-md flex-shrink-0"
                onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                <div className="text-yellow-400 text-base">
                  {book.condition_rating ? (
                    <>
                      {'★'.repeat(Math.floor(book.condition_rating / 2))}
                      {'☆'.repeat(5 - Math.floor(book.condition_rating / 2))}
                      <span className="ml-2 text-sm text-gray-600">{(book.condition_rating / 2).toFixed(1)}</span>
                    </>
                  ) : (
                    <>
                      {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
                      <span className="ml-2 text-sm text-gray-600">{book.rating || 0}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-1">{book.author || 'Unknown Author'}</p>
                <div className="text-base font-semibold mt-2">
                  {/* Discount Price Display */}
                  {book.is_discount_active ? (
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-500 text-lg">
                          ${book.discounted_price?.toFixed(2)}
                        </span>
                        <span className="line-through text-gray-500 text-sm">
                          ${book.price?.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-green-600 text-xs">
                        Save ${(book.price - book.discounted_price)?.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-red-500 text-lg">
                      {typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : book.price}
                    </span>
                  )}
                  {book.original && !book.is_discount_active && (
                    <span className="line-through ml-2 text-gray-400">
                      {book.original}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavouriteReads;
