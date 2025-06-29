import React, { useRef, useState, useEffect } from 'react';

const FeaturedBooks = () => {
  const sliderRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/books');
      if (response.ok) {
        const data = await response.json();
        // Get only books that are on sale, limit to 7 for the slider
        const featuredBooks = data
          .filter(book => book.on_sale)
          .slice(0, 7);
        setBooks(featuredBooks);
      }
    } catch (error) {
      console.error('Error fetching featured books:', error);
      // Fallback to empty array if API fails
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth / 5; // Slide by one card
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getImagePath = (book) => {
    if (book.images && book.images.length > 0) {
      return `http://localhost:3000/${book.images[0]}`;
    }
    if (book.image_path) {
      return `http://localhost:3000/${book.image_path}`;
    }
    return '/assets/book2.jpg'; // fallback
  };

  if (loading) {
    return (
      <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading featured books...</p>
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return (
      <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">No featured books available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fef6f4] py-12 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Books</h2>

        {/* Scrollable book cards with fixed width */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="w-[19%] min-w-[220px] snap-start bg-white rounded-lg p-4 shadow hover:shadow-md transition shrink-0 relative"
            >
              {/* Discount Badge */}
              {book.is_discount_active && book.discount_percentage > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                  -{book.discount_percentage}%
                </div>
              )}

              {/* Book Image */}
              <img 
                src={getImagePath(book)} 
                alt={book.title} 
                className="w-full h-52 object-cover rounded mb-4"
                onError={(e) => {
                  e.target.src = '/assets/book2.jpg';
                }}
              />

              {/* Book Info */}
              <h3 className="text-md font-semibold truncate" title={book.title}>
                {book.title}
              </h3>
              
              <p className="text-xs text-gray-500 mb-1" title={book.author}>
                {book.author || 'Unknown Author'}
              </p>
              
              {/* Rating based on condition */}
              <div className="text-yellow-400 text-sm mb-1">
                ⭐ {(book.condition_rating / 2).toFixed(1)} / 5
              </div>
              
              {/* Price */}
              <div className="text-sm">
                {book.is_discount_active ? (
                  <>
                    <span className="text-red-600 font-bold">
                      ${book.discounted_price?.toFixed(2)}
                    </span>
                    <span className="text-gray-400 line-through text-xs ml-2">
                      ${book.price?.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-bold">
                    ${book.price?.toFixed(2) || '0.00'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
