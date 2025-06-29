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
      className="cursor-pointer w-[19%] min-w-[220px] bg-white rounded-lg p-4 shadow hover:shadow-md transition relative"
    >
      {book.discount && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
          {book.discount}
        </div>
      )}
      <img src={book.img} alt={book.title} className="w-full h-52 object-cover rounded mb-4" />
      <h3 className="text-md font-semibold truncate">{book.title}</h3>
      <p className="text-xs text-gray-500">{book.author}</p>
      <div className="text-yellow-500 text-sm">⭐ {book.rating}</div>
      <div className="text-red-600 font-bold">{book.price}</div>
    </div>
  );
};

export default BookCard;
