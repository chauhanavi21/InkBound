import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Blog</h1>
        <p className="text-gray-600 text-lg">
          Stay tuned for upcoming articles, book reviews, and reading recommendations!
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
