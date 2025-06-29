import React, { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ShoppingPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      // Filter only books that are on sale
      setBooks(data.filter(book => book.on_sale));
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBooks}
              className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">All Books ({books.length})</h2>
        {books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No books available for sale at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingPage;
