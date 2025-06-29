// src/components/FeaturedBooks.jsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import books from '../data/books';

const FeaturedBooks = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  const featuredBooks = books.filter(book => book.isFeatured);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth / 5;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>

        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
        >
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/product/${book.id}`)}
              className="cursor-pointer w-[19%] min-w-[220px] snap-start bg-white rounded-lg p-4 shadow hover:shadow-md transition shrink-0 relative"
            >
              {book.discount && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                  {book.discount}
                </div>
              )}
              <img src={book.img} alt={book.title} className="w-full h-52 object-cover rounded mb-4" />
              <h3 className="text-md font-semibold truncate">{book.title}</h3>
              <p className="text-xs text-gray-500">{book.author}</p>
              <div className="text-yellow-400 text-sm mb-1">⭐ {book.rating} / 5</div>
              <div className="text-red-600 font-bold">{book.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
