// src/pages/ShoppingPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import books from '../data/books';
import BookCard from '../components/BookCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = ['Fiction', 'Romance', 'Thriller', 'Science & Technology'];
const priceRanges = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 to $200', min: 50, max: 200 },
  { label: '$200 to $500', min: 200, max: 500 },
  { label: '$500 & Above', min: 500, max: Infinity },
];

const parsePrice = (price) => {
  if (typeof price === 'string') {
    return parseFloat(price.replace('$', '').replace(',', '')) || 0;
  }
  return price;
};

const ShoppingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [searchTerm, setSearchTerm] = useState(query);

  // Effect to handle direct navigation from search
  useEffect(() => {
    if (!searchTerm) return;

    const matchedBook = books.find(
      (b) =>
        b.title.toLowerCase() === searchTerm ||
        b.author.toLowerCase() === searchTerm
    );

    if (matchedBook) {
      navigate(`/product/${matchedBook.id}`);
    } else if (categories.map((c) => c.toLowerCase()).includes(searchTerm)) {
      setSelectedCategories([capitalize(searchTerm)]);
    }
  }, [searchTerm]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (range) => {
    setSelectedPrice(range);
  };

  const filteredBooks = books.filter((book) => {
    const price = parsePrice(book.price);
    const matchCategory =
      selectedCategories.length === 0 || selectedCategories.includes(book.category);
    const matchPrice =
      !selectedPrice || (price >= selectedPrice.min && price <= selectedPrice.max);

    return matchCategory && matchPrice;
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-[96rem] mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-8">All Books</h2>
        <div className="flex flex-col sm:flex-row gap-10">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[19%] bg-white p-6 rounded shadow-sm">
            <h3 className="text-lg font-bold mb-4">Filters</h3>

            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Category</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {categories.map((cat) => (
                  <div key={cat}>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Price Range</h4>
              <div className="space-y-2 text-sm text-gray-700">
                {priceRanges.map((range) => (
                  <div key={range.label}>
                    <input
                      type="radio"
                      name="price"
                      className="mr-2"
                      checked={selectedPrice?.label === range.label}
                      onChange={() => handlePriceChange(range)}
                    />
                    {range.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Book Grid */}
          <div className="w-full lg:w-[81%]">
            {searchTerm &&
              !filteredBooks.length &&
              !categories.map((c) => c.toLowerCase()).includes(searchTerm) && (
                <div className="text-center text-gray-600 mb-6 text-sm">
                  Nothing found for <strong>"{searchTerm}"</strong>, but here are some related books:
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingPage;
