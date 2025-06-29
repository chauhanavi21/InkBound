import React from 'react';

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="max-w-xl mb-6 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">Members get early Prime Day deals</h1>
          <button className="mt-4 px-5 py-2 bg-yellow-400 text-black font-bold rounded-md">Join Prime</button>
        </div>
        <div>
          <img src="https://via.placeholder.com/200x200" alt="Promo Item" className="rounded-md shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
