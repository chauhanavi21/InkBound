import React from 'react';

const categories = [
  {
    image: '/assets/book1.jpg',
    title: 'Biographies',
    subcategories: [
      'Historical Biographies', 'Leaders & Notable', 'Modern Biographies',
      'Sports Biographies', 'United States Biographies',
    ],
  },
  {
    image: '/assets/book2.jpg',
    title: "Children's Books",
    subcategories: [
      "Action & Adventure", "Children's Humor", "Fantasy Books",
      "Animal Books", "Classic Children's Books",
    ],
  },
  {
    image: '/assets/book1.jpg',
    title: 'Literature & Fiction',
    subcategories: [
      'Classic Books', 'Contemporary', 'Foreign Language Fiction',
      'Genre Fiction', 'History & Criticism',
    ],
  },
  {
    image: '/assets/book1.jpg',
    title: 'Mystery, Thriller',
    subcategories: [
      'Crime Books', 'Detective Books', 'Suspense Books',
      'Mystery Books', 'Thrillers',
    ],
  },
  
];

const ShopByCategory = () => {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
        <button className="bg-[#f56565] text-white px-4 py-2 rounded-full hover:bg-red-600 text-sm">
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {categories.map((cat, idx) => (
          <div key={idx}>
            <img src={cat.image} alt={cat.title} className="rounded-md shadow-md mb-4 w-36 h-48 object-cover" />
            <h3 className="text-lg font-semibold mb-2">{cat.title}</h3>
            <ul className="text-sm text-gray-600 space-y-1 mb-2">
              {cat.subcategories.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <a href="#" className="text-sm font-medium text-gray-800 hover:text-orange-500 flex items-center">
              View More <span className="ml-1">→</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByCategory;
