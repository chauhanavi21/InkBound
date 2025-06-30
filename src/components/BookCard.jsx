// src/components/BookCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart } from 'lucide-react';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const handleClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.action-button')) {
      return;
    }
    navigate(`/product/${book.id}`);
  };

  const addToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please sign in to add items to cart');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bookId: book.id, quantity: 1 })
      });

      if (response.ok) {
        alert('Book added to cart!');
      } else {
        alert('Failed to add book to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add book to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please sign in to add items to wishlist');
      return;
    }

    setAddingToWishlist(true);

    try {
      const response = await fetch('http://localhost:3000/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bookId: book.id })
      });

      if (response.ok) {
        alert('Book added to wishlist!');
      } else {
        alert('Failed to add book to wishlist');
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      alert('Failed to add book to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Get the main image path - works with both database and static data
  const getImagePath = () => {
    if (book.image_path) {
      return `http://localhost:3000/${book.image_path}`;
    }
    if (book.images && book.images.length > 0) {
      return `http://localhost:3000/${book.images[0]}`;
    }
    if (book.img) {
      return book.img;
    }
    return '/assets/book1.jpg'; // fallback
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-lg p-4 shadow hover:shadow-md transition relative min-w-[220px] max-w-[260px] w-full"
    >
      {/* Discount Badge - works with both discount systems */}
      {(book.is_discount_active && book.discount_percentage > 0) && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{book.discount_percentage}% OFF
        </div>
      )}
      {book.discount && !book.is_discount_active && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
          {book.discount}
        </div>
      )}

      {/* Book Image */}
      <img 
        src={getImagePath()} 
        alt={book.title} 
        className="w-full h-52 object-cover rounded mb-4"
        onError={(e) => {
          e.target.src = '/assets/book1.jpg';
        }}
      />

      {/* Book Info */}
      <h3 className="text-md font-semibold truncate" title={book.title}>
        {book.title}
      </h3>
      
      <p className="text-xs text-gray-500 mb-1" title={book.author}>
        {book.author || 'Unknown Author'}
      </p>
      
      {/* Rating - works with both rating systems */}
      <div className="flex items-center text-sm mb-2">
        {book.condition_rating ? (
          <>
            <span className="text-yellow-500">
              {'★'.repeat(Math.floor(book.condition_rating / 2))}
              {'☆'.repeat(5 - Math.floor(book.condition_rating / 2))}
            </span>
            <span className="ml-1 text-gray-600 text-xs">
              ({book.condition_rating}/10)
            </span>
          </>
        ) : book.rating !== undefined ? (
          <>
            <span className="text-yellow-500">
              {'★'.repeat(Math.floor(book.rating))}
              {'☆'.repeat(5 - Math.floor(book.rating))}
            </span>
            <span className="ml-1 text-gray-600 text-xs">
              ({book.rating})
            </span>
          </>
        ) : null}
      </div>
      
      {/* Price - works with both price systems */}
      <div className="text-sm">
        {book.is_discount_active ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-bold text-lg">
              ${book.discounted_price?.toFixed(2)}
            </span>
            <span className="text-gray-400 line-through text-sm">
              ${book.price?.toFixed(2) || '0.00'}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-red-600 font-bold">
              {typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : book.price}
            </span>
            {book.original && (
              <span className="text-gray-400 line-through text-xs">{book.original}</span>
            )}
          </div>
        )}
      </div>

      {/* Genre */}
      {book.genre && (
        <div className="mt-2">
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
            {book.genre}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex space-x-2">
        <button
          onClick={addToCart}
          disabled={addingToCart}
          className="action-button flex-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-medium py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {addingToCart ? (
            'Adding...'
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </>
          )}
        </button>
        
        <button
          onClick={addToWishlist}
          disabled={addingToWishlist}
          className="action-button p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add to Wishlist"
        >
          {addingToWishlist ? (
            <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-600"></div>
          ) : (
            <Heart className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
};

export default BookCard;
