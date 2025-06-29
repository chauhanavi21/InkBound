// src/components/BookCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${book.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-white rounded-lg p-4 shadow hover:shadow-md transition relative min-w-[220px] max-w-[260px] w-full"
    >
      {/* Discount Badge */}
      {book.discount && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
          {book.discount}
        </div>
      )}

      {/* Book Image */}
      <img
        src={book.img}
        alt={book.title}
        className="w-full h-52 object-cover rounded mb-4"
      />

      {/* Book Info */}
      <h3 className="text-md font-semibold truncate">{book.title}</h3>
      <p className="text-xs text-gray-500">{book.author}</p>

      {/* Rating */}
      {book.rating !== undefined && (
        <div className="text-yellow-500 text-sm">
          {'★'.repeat(Math.floor(book.rating))}
          {'☆'.repeat(5 - Math.floor(book.rating))}
          <span className="ml-1 text-xs text-gray-600">({book.rating})</span>
        </div>
      )}

      {/* Price */}
      <div className="text-sm font-semibold mt-1">
        <span className="text-red-600">{book.price}</span>
        {book.original && (
          <span className="text-gray-400 line-through ml-2 text-xs">{book.original}</span>
        )}
      </div>
    </div>
  );
};

export default BookCard;
