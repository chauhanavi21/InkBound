import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import TokenCleaner from './components/TokenCleaner';
import Home from './pages/Home';
import ShoppingPage from './pages/ShoppingPage';
import ProductPage from './pages/ProductPage';
import AdminDashboard from './pages/AdminDashboard';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <AuthProvider>
      <TokenCleaner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShoppingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
