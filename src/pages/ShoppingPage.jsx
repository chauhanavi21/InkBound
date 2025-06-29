import React from 'react';
import BookCard from '../components/BookCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import books from '../data/books';// ✅ Import full list from central data
// ⬆ Make sure the path is correct

const ShoppingPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">All Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingPage;
