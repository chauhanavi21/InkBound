// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import FeaturesGrid from '../components/FeaturesGrid';
import TopBooksGrid from '../components/TopBooksGrid';
import FeaturedBooks from '../components/FeaturedBooks';
import FeaturedAuthor from '../components/FeaturedAuthor';
import FavouriteReads from '../components/FavouriteReads';
import ShopByCategory from '../components/ShopByCategory';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="font-sans bg-gray-100 min-h-screen">
      <Navbar />
      <HeroBanner />
      <FeaturesGrid />
      <FeaturedBooks />
      <FeaturedAuthor />
      <FavouriteReads />
      <ShopByCategory />
      <TopBooksGrid />
      <Footer />
    </div>
  );
};

export default Home;
