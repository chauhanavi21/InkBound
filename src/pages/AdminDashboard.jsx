import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaEye, FaBook, FaUsers, FaDollarSign, FaChartLine } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import AdminBookTable from '../components/AdminBookTable';
import AdminAddBook from '../components/AdminAddBook';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalRevenue: 0,
    avgRating: 0,
    booksOnSale: 0
  });

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/books');
      const data = await response.json();
      setBooks(data);
      
      // Calculate stats
      const totalBooks = data.length;
      const booksOnSale = data.filter(book => book.on_sale).length;
      const totalRevenue = data.reduce((sum, book) => sum + (book.price || 0), 0);
      const avgRating = data.reduce((sum, book) => sum + (book.condition_rating || 0), 0) / totalBooks || 0;
      
      setStats({
        totalBooks,
        totalRevenue: totalRevenue.toFixed(2),
        avgRating: avgRating.toFixed(1),
        booksOnSale
      });
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaBook className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBooks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <FaChartLine className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Condition</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgRating}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaEye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Sale</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.booksOnSale}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Books */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Books</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.slice(0, 6).map((book) => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                  <img 
                    src={`http://localhost:3000/${book.image_path}`} 
                    alt={book.title}
                    className="w-full h-32 object-cover rounded mb-3"
                    onError={(e) => {
                      e.target.src = '/assets/book1.jpg';
                    }}
                  />
                  <h4 className="font-semibold text-sm truncate">{book.title}</h4>
                  <p className="text-xs text-gray-600">{book.author}</p>
                  <p className="text-sm font-bold text-green-600">${book.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#131921] text-white min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center space-x-3 ${
                  activeTab === 'overview' 
                    ? 'bg-yellow-400 text-black' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <FaChartLine />
                <span>Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('books')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center space-x-3 ${
                  activeTab === 'books' 
                    ? 'bg-yellow-400 text-black' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <FaBook />
                <span>Manage Books</span>
              </button>
              
              <button
                onClick={() => setActiveTab('add-book')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center space-x-3 ${
                  activeTab === 'add-book' 
                    ? 'bg-yellow-400 text-black' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <FaPlus />
                <span>Add Book</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'books' && 'Manage Books'}
              {activeTab === 'add-book' && 'Add New Book'}
            </h1>
          </div>

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'books' && (
            <AdminBookTable 
              books={books} 
              onRefresh={fetchBooks}
              loading={loading}
            />
          )}
          {activeTab === 'add-book' && (
            <AdminAddBook onBookAdded={fetchBooks} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 