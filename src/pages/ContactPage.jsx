import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg">
          We'd love to hear from you! Drop us a message at <span className="font-medium text-blue-600">contact@inkbound.com</span>
          or use the form (coming soon).
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
