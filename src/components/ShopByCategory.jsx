import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import staticBooks from '../data/books';

const ShopByCategory = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/books');
      let books;
      
      if (response.ok) {
        books = await response.json();
      } else {
        throw new Error('API not available');
      }
      
      // Generate categories from book data
      const categoryData = generateCategoriesFromBooks(books);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error fetching books for categories, using static data:', error);
      // Fallback to static data
      const categoryData = generateCategoriesFromBooks(staticBooks);
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  };

  const generateCategoriesFromBooks = (books) => {
    // Get unique categories and sample book for each
    const categoryMap = new Map();
    
    books.forEach(book => {
      const category = book.genre || book.category;
      if (category && !categoryMap.has(category)) {
        categoryMap.set(category, {
          title: category,
          image: book.img || (book.images && book.images[0] ? `http://localhost:3000/${book.images[0]}` : '/assets/book1.jpg'),
          count: 1
        });
      } else if (category) {
        categoryMap.get(category).count++;
      }
    });

    return Array.from(categoryMap.values()).slice(0, 4); // Limit to 4 categories
  };

  const handleViewMore = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-10">Shop by Category</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <img 
              src={cat.image} 
              alt={cat.title} 
              className="rounded-md shadow-md mb-4 w-36 h-48 object-cover"
              onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
            />
            <h3 className="text-lg font-semibold mb-2">{cat.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{cat.count} books available</p>
            <button
              onClick={() => handleViewMore(cat.title)}
              className="text-sm font-medium text-gray-800 hover:text-orange-500 flex items-center"
            >
              View More <span className="ml-1">→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByCategory;
