import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShoppingPage from './pages/ShoppingPage';
import ProductPage from './pages/ProductPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ShoppingPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
