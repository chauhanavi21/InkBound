import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShoppingPage from './pages/ShoppingPage';
import ProductPage from './pages/ProductPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ShoppingPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
