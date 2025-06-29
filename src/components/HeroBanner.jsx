import React, { useState, useEffect } from 'react';

const slides = [
  {
    image: '/assets/book1.jpg',
    title: 'Top 10 Books',
    subtitle: 'To Make It A Great Year',
    highlight: '10 Books',
  },
  {
    image: '/assets/book2.jpg',
    title: 'Must Reads',
    subtitle: 'To Ignite Your Imagination',
    highlight: 'Must Reads',
  },
  {
    image: '/assets/author.jpg',
    title: 'Editor Picks',
    subtitle: 'Curated Just For You',
    highlight: 'Editor Picks',
  },
];

const HeroBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { image, title, subtitle, highlight } = slides[index];

  return (
    <div className="bg-[#fef6f4] py-16 px-6 min-h-[580px] transition-all duration-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-evenly">
        {/* Image */}
        <div className="w-[320px] h-[400px] flex items-center justify-center">
          <img
            src={image}
            alt="Book Promo"
            className="w-full h-full object-cover rounded-lg shadow-xl transition-all duration-700"
          />
        </div>

        {/* Text */}
        <div className="md:ml-10 text-center md:text-left mt-10 md:mt-0">
          <p className="text-sm uppercase text-gray-600 font-semibold mb-2 tracking-wider">
            Editor's Choice
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-black">
              {title.replace(highlight, '')}
              <span className="underline decoration-orange-500"> {highlight}</span>
            </span>
            <br />
            {subtitle}
          </h1>
          <button className="mt-4 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full">
            Shop Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
