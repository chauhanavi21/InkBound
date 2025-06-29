// src/components/BookCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${book.id}`);
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
    </div>
  );
};

export default BookCard;
