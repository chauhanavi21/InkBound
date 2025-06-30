// src/components/TopBooksGrid.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import staticBooks from '../data/books';

const TopBooksGrid = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopBooks();
  }, []);

  const fetchTopBooks = async () => {
    try {
      // First try to get admin-selected top books
      try {
        const featuredResponse = await fetch('http://localhost:3000/api/featured-content/top_books');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData && featuredData.length > 0) {
            setBooks(featuredData.slice(0, 4));
            setLoading(false);
            return;
          }
        }
      } catch (featuredError) {
        console.log('No admin-selected top books, using automatic selection');
      }

      // Fallback to automatic selection
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        // Get top books with best prices or highest ratings, limit to 4
        const topBooks = data
          .filter(book => book.on_sale)
          .sort((a, b) => (b.condition_rating || 0) - (a.condition_rating || 0))
          .slice(0, 4);
        setBooks(topBooks);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('❌ Error fetching top books from database:', error);
      console.log('⚠️ Database not available - please start backend server with "npm start"');
      // Show empty state instead of static fallback to maintain data consistency
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <section className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Top Book Deals</h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading top deals...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Top Book Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((book, idx) => (
            <div 
              key={book.id || idx} 
              className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md cursor-pointer transition relative"
              onClick={() => navigate(`/product/${book.id}`)}
            >
              {/* Discount Badge - Subtle overlay on book cover */}
              {book.is_discount_active && book.discount_percentage > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                  -{book.discount_percentage}%
                </div>
              )}
              <img 
                src={book.img || (book.image_path ? `http://localhost:3000/${book.image_path}` : (book.images && book.images[0] ? `http://localhost:3000/${book.images[0]}` : '/assets/book1.jpg'))} 
                alt={book.title} 
                className="w-full h-40 object-cover mb-3 rounded"
                onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
              />
              <h3 className="text-md font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author || 'Unknown Author'}</p>
              <div className="mt-2 flex justify-between items-start">
                <div className="flex flex-col space-y-1">
                  {/* Discount Price Display */}
                  {book.is_discount_active ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold text-lg">
                          ${book.discounted_price?.toFixed(2)}
                        </span>
                        <span className="line-through text-gray-500 text-sm">
                          ${book.price?.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-red-600 text-xs font-medium">
                        Save ${(book.price - book.discounted_price)?.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-green-600 font-bold text-lg">
                      {typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : book.price}
                    </span>
                  )}
                </div>
                <button className="text-sm text-yellow-500 hover:underline mt-1">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBooksGrid;
