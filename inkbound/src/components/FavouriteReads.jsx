// src/components/FavouriteReads.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import books from '../data/books'; // <-- central source of truth

const FavouriteReads = () => {
  const favouriteBooks = books.filter((book) => book.isFavorite);

  return (
    <div className="bg-white px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Our Favourite Reads</h2>
          <button className="text-white bg-red-500 hover:bg-red-600 px-5 py-2 text-sm rounded-full">
            View All →
          </button>
        </div>

        <div className="grid gap-y-10 gap-x-6 md:grid-cols-3">
          {favouriteBooks.map((book) => (
            <Link
              to={`/product/${book.id}`}
              key={book.id}
              className="flex items-start space-x-4 hover:opacity-90 transition"
            >
              <img
                src={book.img}
                alt={book.title}
                className="w-24 h-32 object-cover rounded shadow-md flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                <div className="text-yellow-400 text-base">
                  {'★'.repeat(book.rating || 0)}{'☆'.repeat(5 - (book.rating || 0))}
                  <span className="ml-2 text-sm text-gray-600">{book.rating || 0}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{book.author}</p>
                <div className="text-base font-semibold mt-1">
                  <span className="text-red-500">{book.price}</span>
                  {book.original && (
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
