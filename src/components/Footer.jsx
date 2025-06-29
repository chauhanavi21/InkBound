import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#131921] text-white py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">

        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">InkBound</h3>
          <p className="text-sm text-gray-300">
            Your trusted source for books, knowledge, and inspiration. Explore millions of titles from every genre.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-yellow-400">Home</a></li>
            <li><a href="#" className="hover:text-yellow-400">Shop</a></li>
            <li><a href="#" className="hover:text-yellow-400">Blog</a></li>
            <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Categories</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-yellow-400">Fiction</a></li>
            <li><a href="#" className="hover:text-yellow-400">Biographies</a></li>
            <li><a href="#" className="hover:text-yellow-400">Children's Books</a></li>
            <li><a href="#" className="hover:text-yellow-400">History</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><span className="font-medium">Address:</span> 123 Book St, NY 10001</li>
            <li><span className="font-medium">Email:</span> support@inkbound.com</li>
            <li><span className="font-medium">Phone:</span> +1 (555) 123-4567</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Subscribe</h4>
          <p className="text-sm text-gray-300 mb-3">
            Get updates on new releases and offers.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 rounded-l bg-white text-black text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-r text-black font-semibold text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-sm text-gray-400 mt-10 border-t border-gray-700 pt-6">
        &copy; {new Date().getFullYear()} InkBound. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
