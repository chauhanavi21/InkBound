import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShoppingPage from './pages/ShoppingPage';
import ProductPage from './pages/ProductPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ShoppingPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
