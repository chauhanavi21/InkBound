import React from 'react';
import { useParams } from 'react-router-dom';
import books from '../data/books';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProductPage = () => {
  const { id } = useParams();
  const book = books.find((b) => b.id === id); // Ensure ID match as string

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="text-center mt-32 text-lg text-gray-600">Book not found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-[156rem] mx-auto py-16 px-4 flex flex-col md:flex-row gap-10">
        {/* Book Image */}
        <div className="w-full md:[width:38%] flex justify-center">
          <img
            src={book.img}
            alt={book.title}
            className="w-72 h-[420px] object-cover rounded shadow-lg"
          />
        </div>

        {/* Book Details */}
        <div className="w-full md:[width:62%]">
          <h2 className="text-4xl font-bold mb-4">{book.title}</h2>
          <p className="text-lg text-gray-700 mb-2">by <span className="font-semibold">{book.author}</span></p>
          <p className="text-yellow-500 font-medium mb-4">⭐ {book.rating} / 5</p>

          <div className="text-3xl text-red-500 font-extrabold mb-2">{book.price}</div>
          {book.original && (
            <p className="text-gray-500 line-through text-md mb-4">${book.original}</p>
          )}

          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full mt-4 transition duration-200">
            Add to Cart
          </button>

          <p className="mt-10 text-sm text-gray-600 leading-relaxed">
            Discover more about <span className="font-medium">{book.title}</span> by <span className="font-medium">{book.author}</span>.
            This book is categorized under <span className="font-medium">{book.category}</span> and highly rated by our readers.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
