import React from 'react';
import { useParams } from 'react-router-dom';
import books from '../data/books'; // ✅ Make sure this path is correct

const ProductPage = () => {
  const { id } = useParams();
  const book = books.find(b => b.id === id); // Be sure ID is compared as string

  if (!book) {
    return <div className="text-center mt-20 text-lg text-gray-600">Book not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-10">
        <img src={book.img} alt={book.title} className="w-60 h-80 object-cover rounded shadow" />
        <div>
          <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
          <p className="text-gray-600 mb-2">by {book.author}</p>
          <p className="text-yellow-500 mb-4">Rating: {book.rating} / 5</p>
          <p className="text-2xl text-red-500 font-semibold mb-2">{book.price}</p>
          {book.original && <p className="line-through text-gray-400">${book.original}</p>}
          <button className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
