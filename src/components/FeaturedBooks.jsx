// src/components/FeaturedBooks.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import staticBooks from '../data/books';

const FeaturedBooks = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      // First try to get admin-selected featured books
      try {
        const featuredResponse = await fetch('http://localhost:3000/api/featured-content/featured_books');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          console.log('🎯 DEBUG: Featured books data received:', featuredData.map(book => ({
            title: book.title,
            is_discount_active: book.is_discount_active,
            discount_percentage: book.discount_percentage,
            discounted_price: book.discounted_price,
            price: book.price
          })));
          if (featuredData && featuredData.length > 0) {
            setBooks(featuredData.slice(0, 7)); // Limit to 7 for slider
            setLoading(false);
            return;
          }
        }
      } catch (featuredError) {
        console.log('No admin-selected featured books, using automatic selection');
      }

      // Fallback to automatic selection from database
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        
        // Get only books that are on sale, limit to 7 for the slider
        const featuredBooks = data
          .filter(book => book.on_sale)
          .slice(0, 7);
        setBooks(featuredBooks);
        console.log('✅ Featured books loaded from database:', featuredBooks.length);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.error('❌ Error fetching from database:', error);
      console.log('⚠️ Database not available - please start backend server with "npm start"');
      // Show empty state instead of static fallback
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth / 5;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getImagePath = (book) => {
    if (book.image_path) {
      return `http://localhost:3000/${book.image_path}`;
    }
    if (book.images && book.images.length > 0) {
      return `http://localhost:3000/${book.images[0]}`;
    }
    return '/assets/book2.jpg'; // fallback
  };

  if (loading) {
    return (
      <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading featured books...</p>
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">No featured books available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>

        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
        >
                  {books.map((book) => {
          console.log(`🔍 Rendering book ${book.title}:`, {
            is_discount_active: book.is_discount_active,
            discount_percentage: book.discount_percentage,
            discounted_price: book.discounted_price,
            price: book.price
          });
          
          return (
            <div
              key={book.id}
              onClick={() => navigate(`/product/${book.id}`)}
              className="cursor-pointer w-[19%] min-w-[220px] snap-start bg-white rounded-lg p-4 shadow hover:shadow-md transition shrink-0 relative"
            >
              {/* Discount Badge - Subtle overlay on book cover */}
              {(book.is_discount_active && book.discount_percentage > 0) && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                  -{book.discount_percentage}%
                </div>
              )}
                            

              {book.discount && !book.is_discount_active && (
                <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10">
                  {book.discount}
                </div>
              )}

              {/* Book Image - supports both systems */}
              <img 
                src={book.img || getImagePath(book)} 
                alt={book.title} 
                className="w-full h-52 object-cover rounded mb-4"
                onError={(e) => {
                  e.target.src = '/assets/book2.jpg';
                }}
              />

              {/* Book Info */}
              <h3 className="text-md font-semibold truncate" title={book.title}>
                {book.title}
              </h3>
              
              <p className="text-xs text-gray-500 mb-1" title={book.author}>
                {book.author || 'Unknown Author'}
              </p>
              
              {/* Rating - supports both systems */}
              <div className="text-yellow-400 text-sm mb-1">
                {book.condition_rating ? (
                  <>⭐ {(book.condition_rating / 2).toFixed(1)} / 5</>
                ) : (
                  <>⭐ {book.rating} / 5</>
                )}
              </div>
              
              {/* Price - supports both systems */}
              <div className="text-sm mt-2">
                {book.is_discount_active ? (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold text-base">
                        ${book.discounted_price?.toFixed(2)}
                      </span>
                      <span className="text-gray-500 line-through text-sm">
                        ${book.price?.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-green-600 text-xs font-medium">
                      Save ${(book.price - book.discounted_price)?.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold text-base">
                    {typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : book.price}
                  </span>
                )}

              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
