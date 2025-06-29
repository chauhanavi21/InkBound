// src/components/TopBooksGrid.jsx
import React from 'react';

const books = [
  { title: 'Atomic Habits', author: 'James Clear', img: "/assets/book1.jpg"},
  { title: 'Deep Work', author: 'Cal Newport', img:  "/assets/book2.jpg"},
  { title: 'The Alchemist', author: 'Paulo Coelho', img:  "/assets/book1.jpg" },
  { title: '1984', author: 'George Orwell', img:  "/assets/book2.jpg" },
];

const TopBooksGrid = () => {
  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Top Book Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((book, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md">
              <img src={book.img} alt={book.title} className="w-full h-40 object-cover mb-3 rounded" />
              <h3 className="text-md font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <button className="mt-2 text-sm text-yellow-500 hover:underline">View Details</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBooksGrid;
