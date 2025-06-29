import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { image: '/assets/book1.jpg', title: 'Fiction' },
  { image: '/assets/book2.jpg', title: 'Romance' },
  { image: '/assets/book1.jpg', title: 'Thriller' },
  { image: '/assets/book2.jpg', title: 'Non-Fiction' }, // You can adjust the fourth as needed
];

const ShopByCategory = () => {
  const navigate = useNavigate();

  const handleViewMore = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <img src={cat.image} alt={cat.title} className="rounded-md shadow-md mb-4 w-36 h-48 object-cover" />
            <h3 className="text-lg font-semibold mb-2">{cat.title}</h3>
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
