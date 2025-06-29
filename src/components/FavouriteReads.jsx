import React from 'react';
import { Link } from 'react-router-dom';

const favouriteBooks = [
  {
    id: '1',
    title: 'Life Flight',
    author: 'Misty Figueroa',
    price: 115.72,
    rating: 4,
    image: '/assets/book1.jpg',
  },
  {
    id: '2',
    title: 'Annie Leibovitz: Wonderland',
    author: 'Rita James',
    price: 35.19,
    rating: 5,
    image: '/assets/book1.jpg',
  },
  {
    id: '3',
    title: 'Treachery: Alpha Colony Book 8',
    author: 'Jessica Munoz',
    price: 569.0,
    original: 814.66,
    rating: 4,
    image: '/assets/book1.jpg',
  },
  {
    id: '4',
    title: 'His Saving Grace',
    author: 'Misty Figueroa',
    price: 201.0,
    original: 288.74,
    rating: 5,
    image: '/assets/book2.jpg',
  },
  {
    id: '5',
    title: 'House of Sky and Breath',
    author: 'Ernesto Wade',
    price: 72.99,
    original: 86.99,
    rating: 4,
    image: '/assets/book2.jpg',
  },
  {
    id: '6',
    title: 'The Girlfriend Arrangement',
    author: 'Misty Figueroa',
    price: 761.67,
    rating: 0,
    image: '/assets/book2.jpg',
  },
];

const FavouriteReads = () => {
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
                src={book.image}
                alt={book.title}
                className="w-24 h-32 object-cover rounded shadow-md flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                <div className="text-yellow-400 text-base">
                  {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                  <span className="ml-2 text-sm text-gray-600">{book.rating}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{book.author}</p>
                <div className="text-base font-semibold mt-1">
                  <span className="text-red-500">${book.price.toFixed(2)}</span>
                  {book.original && (
                    <span className="line-through ml-2 text-gray-400">
                      ${book.original.toFixed(2)}
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
