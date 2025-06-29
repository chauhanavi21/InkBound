import React, { useRef } from 'react';

const books = [
  { title: 'The Story of Success', author: 'Arthur Gonzalez', price: '$50.89', rating: 3.5, img: "/assets/book2.jpg" },
  { title: 'Annie Leibovitz', author: 'Dana Chambers', price: '$316.15', rating: 4, img: "/assets/book2.jpg" },
  { title: 'My Dearest Darkest', author: 'Enrique Wallace', price: '$914.53', rating: 3.5, img:"/assets/book2.jpg" },
  { title: 'House of Sky and Breath', author: 'Ernesto Wade', price: '$72.99', originalPrice: '$86.99', discount: '-16%', rating: 4, img: "/assets/book2.jpg"},
  { title: 'Each of Us a Desert', author: 'Georgia Ramirez', price: '$825.85', rating: 4, img:"/assets/book2.jpg" },
  { title: 'The Silent Patient', author: 'Alex Michaelides', price: '$38.40', rating: 4.5, img: "/assets/book2.jpg"},
  { title: 'The Power of Now', author: 'Eckhart Tolle', price: '$22.99', rating: 4.2, img: "/assets/book2.jpg" },
];

const FeaturedBooks = () => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth / 5; // Slide by one card
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

        {/* Scrollable book cards with fixed width */}
        <div
          ref={sliderRef}
          className="flex overflow-x-auto gap-6 scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
        >
          {books.map((book, index) => (
            <div
              key={index}
              className="w-[19%] min-w-[220px] snap-start bg-white rounded-lg p-4 shadow hover:shadow-md transition shrink-0 relative"
            >
              {book.discount && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                  {book.discount}
                </div>
              )}
              <img src={book.img} alt={book.title} className="w-full h-52 object-cover rounded mb-4" />
              <h3 className="text-md font-semibold">{book.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{book.author}</p>
              <div className="text-yellow-400 text-sm mb-1">⭐ {book.rating} / 5</div>
              <div className="text-sm">
                <span className="text-red-600 font-bold">{book.price}</span>
                {book.originalPrice && (
                  <span className="text-gray-400 line-through text-xs ml-2">{book.originalPrice}</span>
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
