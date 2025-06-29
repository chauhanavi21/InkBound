import React from 'react';
import { useNavigate } from 'react-router-dom';
import books from '../data/books';

const FeaturedAuthor = () => {
  const navigate = useNavigate();
  const authorName = 'Jessica Munoz';

  // Filter and take only the first 4 books
  const authorBooks = books.filter(book => book.author === authorName).slice(0, 4);

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-center justify-between">
        {/* Author Bio */}
        <div className="max-w-sm text-center lg:text-left">
          <p className="text-red-500 uppercase text-sm font-bold mb-2">Featured Author</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{authorName}</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Jessica Munoz is a bestselling fiction author known for gripping thrillers
            and heartfelt narratives. Her work captivates readers around the globe.
          </p>
          <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm">
            View Profile
          </button>
        </div>

        {/* Author Image */}
        <div className="w-[260px] h-[380px] overflow-hidden rounded-lg shadow-lg">
          <img
            src="/assets/author.jpg"
            alt="Featured"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Author's Book List */}
        <div className="grid grid-cols-2 gap-6">
          {authorBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/product/${book.id}`)}
              className="cursor-pointer w-36 text-sm text-center"
            >
              <div className="relative">
                <img
                  src={book.img}
                  alt={book.title}
                  className="h-48 w-full object-cover rounded-lg shadow"
                />
                {book.discount && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-xs px-2 py-0.5 rounded-full">
                    {book.discount}
                  </span>
                )}
              </div>
              <p className="mt-2 font-medium truncate">{book.title}</p>
              <p className="text-red-500 font-bold">{book.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedAuthor;
