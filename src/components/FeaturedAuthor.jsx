import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import staticBooks from '../data/books';

const FeaturedAuthor = () => {
  const navigate = useNavigate();
  const [authorData, setAuthorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedAuthor();
  }, []);

  const fetchFeaturedAuthor = async () => {
    try {
      // First try to get admin-selected featured author
      try {
        const featuredResponse = await fetch('http://localhost:3000/api/featured-author');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          if (featuredData && featuredData.author_name) {
            // Get all books to find books by this author
            const booksResponse = await fetch('http://localhost:3000/api/books');
            if (booksResponse.ok) {
              const allBooks = await booksResponse.json();
              const authorBooks = allBooks.filter(book => book.author === featuredData.author_name);
              
              if (authorBooks.length > 0) {
                setAuthorData({
                  name: featuredData.author_name,
                  books: authorBooks.slice(0, 4),
                  bookCount: authorBooks.length,
                  photo: featuredData.author_photo_path,
                  bio: `${featuredData.author_name} is a bestselling author with ${authorBooks.length} books in our collection. Known for captivating stories and compelling narratives that engage readers worldwide.`
                });
                setLoading(false);
                return;
              }
            }
          }
        }
      } catch (featuredError) {
        console.log('No admin-selected featured author, using automatic selection');
      }

      // Fallback to automatic selection
      const response = await fetch('http://localhost:3000/api/books');
      let books;
      
      if (response.ok) {
        books = await response.json();
      } else {
        throw new Error('API not available');
      }
      
      const featuredAuthor = findFeaturedAuthor(books);
      setAuthorData(featuredAuthor);
    } catch (error) {
      console.error('Error fetching books for featured author, using static data:', error);
      // Final fallback to static data
      const featuredAuthor = findFeaturedAuthor(staticBooks);
      setAuthorData(featuredAuthor);
    } finally {
      setLoading(false);
    }
  };

  const findFeaturedAuthor = (books) => {
    // Find author with most books in the collection
    const authorCount = {};
    books.forEach(book => {
      const author = book.author;
      if (author) {
        authorCount[author] = (authorCount[author] || 0) + 1;
      }
    });

    // Get the author with most books
    const featuredAuthorName = Object.keys(authorCount).reduce((a, b) => 
      authorCount[a] > authorCount[b] ? a : b
    );

    // Get books by this author
    const authorBooks = books
      .filter(book => book.author === featuredAuthorName)
      .slice(0, 4);

    return {
      name: featuredAuthorName,
      books: authorBooks,
      bookCount: authorCount[featuredAuthorName],
      bio: `${featuredAuthorName} is a bestselling author with ${authorCount[featuredAuthorName]} books in our collection. Known for captivating stories and compelling narratives that engage readers worldwide.`
    };
  };

  if (loading) {
    return (
      <div className="bg-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading featured author...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authorData) {
    return null; // Don't show section if no author data
  }

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-center justify-between">
        {/* Author Bio */}
        <div className="max-w-sm text-center lg:text-left">
          <p className="text-red-500 uppercase text-sm font-bold mb-2">Featured Author</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{authorData.name}</h2>
          <p className="text-gray-600 mb-6 text-sm">
            {authorData.bio}
          </p>
          <button 
            onClick={() => navigate(`/shop?search=${encodeURIComponent(authorData.name.toLowerCase())}`)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm"
          >
            View All Books
          </button>
        </div>

        {/* Author Image */}
        <div className="w-[260px] h-[380px] overflow-hidden rounded-lg shadow-lg">
          <img
            src={authorData.photo ? `http://localhost:3000/${authorData.photo}` : "/assets/author.jpg"}
            alt="Featured Author"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/assets/author.jpg';
            }}
          />
        </div>

        {/* Author's Book List */}
        <div className="grid grid-cols-2 gap-6">
          {authorData.books.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/product/${book.id}`)}
              className="cursor-pointer w-36 text-sm text-center"
            >
              <div className="relative">
                <img
                  src={book.img || (book.image_path ? `http://localhost:3000/${book.image_path}` : (book.images && book.images[0] ? `http://localhost:3000/${book.images[0]}` : '/assets/book1.jpg'))}
                  alt={book.title}
                  className="h-48 w-full object-cover rounded-lg shadow"
                  onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
                />
                {/* Discount Badge */}
                {(book.is_discount_active && book.discount_percentage > 0) && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                    -{book.discount_percentage}%
                  </span>
                )}
              </div>
              <p className="mt-2 font-medium truncate">{book.title}</p>
              
              {/* Price with discount logic */}
              <div className="text-sm">
                {book.is_discount_active ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1">
                      <span className="text-red-600 font-bold">
                        ${book.discounted_price?.toFixed(2)}
                      </span>
                      <span className="text-gray-500 line-through text-xs">
                        ${book.price?.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-green-600 text-xs font-medium">
                      Save ${(book.price - book.discounted_price)?.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-bold">
                    {typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : book.price}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedAuthor;
