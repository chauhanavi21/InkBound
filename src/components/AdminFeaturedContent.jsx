import React, { useState, useEffect } from 'react';
import { FaStar, FaUser, FaBookOpen, FaEdit, FaTrash, FaPlus, FaCheck, FaTimes, FaImage, FaEye } from 'react-icons/fa';

const AdminFeaturedContent = () => {
  const [books, setBooks] = useState([]);
  const [featuredContent, setFeaturedContent] = useState({
    featured_books: [],
    editors_picks: [],
    top_books: [],
    featured_author: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('featured_books');
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [authorPhotoPreview, setAuthorPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  const tabs = [
    { id: 'featured_books', name: 'Featured Books', icon: FaStar, limit: 6, color: 'blue' },
    { id: 'editors_picks', name: "Editor's Picks", icon: FaEdit, limit: 4, color: 'green' },
    { id: 'top_books', name: 'Top Books', icon: FaBookOpen, limit: 8, color: 'purple' },
    { id: 'featured_author', name: 'Featured Author', icon: FaUser, limit: 1, color: 'orange' }
  ];

  // Fetch all books and current featured content
  useEffect(() => {
    Promise.all([fetchBooks(), fetchFeaturedContent()]);
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/featured-content');
      const data = await response.json();
      
      // Organize featured content by type
      const organized = {
        featured_books: data.filter(item => item.type === 'featured_books'),
        editors_picks: data.filter(item => item.type === 'editors_picks'),
        top_books: data.filter(item => item.type === 'top_books'),
        featured_author: data.find(item => item.type === 'featured_author') || null
      };
      
      setFeaturedContent(organized);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFeatured = async (bookId, type) => {
    try {
      setSaving(true);
      
      await fetch('http://localhost:3000/api/featured-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          bookId: bookId
        })
      });
      
      setMessage(`✅ Book added to ${type.replace('_', ' ')}!`);
      await fetchFeaturedContent();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to featured:', error);
      setMessage(`❌ Error adding book`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromFeatured = async (itemId, type) => {
    try {
      setSaving(true);
      
      // Use the new individual item removal endpoint
      await fetch(`http://localhost:3000/api/featured-content/item/${itemId}`, {
        method: 'DELETE'
      });
      
      setMessage(`✅ Book removed from ${type.replace('_', ' ')}!`);
      await fetchFeaturedContent();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing from featured:', error);
      setMessage(`❌ Error removing book`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAuthorPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAuthorPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAuthorPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAuthorPhoto = async () => {
    if (!authorPhoto) return null;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('authorPhoto', authorPhoto);

      const response = await fetch('http://localhost:3000/api/upload-author-photo', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        return data.imagePath;
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading author photo:', error);
      setMessage(`❌ Error uploading author photo: ${error.message}`);
      setTimeout(() => setMessage(''), 3000);
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSetFeaturedAuthor = async (authorName) => {
    try {
      setSaving(true);
      
      let authorPhotoPath = null;
      if (authorPhoto) {
        authorPhotoPath = await uploadAuthorPhoto();
        if (!authorPhotoPath) return;
      }

      // Use the replace endpoint for featured author (only one at a time)
      await fetch('http://localhost:3000/api/featured-content/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'featured_author',
          authorName: authorName,
          authorPhotoPath: authorPhotoPath
        })
      });
      
      setMessage(`✅ Featured author updated!`);
      await fetchFeaturedContent();
      setAuthorPhoto(null);
      setAuthorPhotoPreview(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error setting featured author:', error);
      setMessage(`❌ Error updating featured author`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getUniqueAuthors = () => {
    const authors = [...new Set(books.map(book => book.author))];
    return authors.filter(author => author && author.trim() !== '');
  };

  const getAvailableBooks = (type) => {
    const featuredBookIds = featuredContent[type]?.map(item => item.book_id) || [];
    let availableBooks = books.filter(book => !featuredBookIds.includes(book.id));

    // Apply search filter
    if (searchTerm) {
      availableBooks = availableBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    availableBooks.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortBy === 'condition_rating') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return availableBooks;
  };

  const getCurrentTypeData = () => {
    if (activeTab === 'featured_author') {
      return featuredContent.featured_author;
    }
    return featuredContent[activeTab] || [];
  };

  const getCurrentLimit = () => {
    return tabs.find(tab => tab.id === activeTab)?.limit || 0;
  };

  const getCurrentColor = () => {
    return tabs.find(tab => tab.id === activeTab)?.color || 'blue';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-[#131921] text-white p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Featured Content Management</h2>
        <p className="text-gray-300 mb-4">
          Manage what appears on your homepage. Select books for different sections and choose your featured author.
        </p>
        
        {/* Quick Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#232F3E] rounded-lg p-4">
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl">
              {featuredContent.featured_books?.length || 0}/6
            </div>
            <div className="text-gray-300 text-sm">Featured Books</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl">
              {featuredContent.editors_picks?.length || 0}/4
            </div>
            <div className="text-gray-300 text-sm">Editor's Picks</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl">
              {featuredContent.top_books?.length || 0}/8
            </div>
            <div className="text-gray-300 text-sm">Top Books</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl">
              {featuredContent.featured_author ? '✓' : '✗'}
            </div>
            <div className="text-gray-300 text-sm">Featured Author</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const currentCount = tab.id === 'featured_author' 
                ? (featuredContent.featured_author ? 1 : 0)
                : featuredContent[tab.id]?.length || 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-yellow-400 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`text-${tab.color}-500`} />
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {currentCount}/{tab.limit}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'featured_author' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Featured Author Selection</h3>
                {featuredContent.featured_author && (
                  <button
                    onClick={() => handleRemoveFromFeatured(featuredContent.featured_author.id, 'featured_author')}
                    disabled={saving}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Current
                  </button>
                )}
              </div>

              {/* Current Featured Author */}
              {featuredContent.featured_author && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Current Featured Author</h4>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                      {featuredContent.featured_author.author_photo_path ? (
                        <img
                          src={`http://localhost:3000/${featuredContent.featured_author.author_photo_path}`}
                          alt="Author"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{featuredContent.featured_author.author_name}</p>
                      <p className="text-sm text-gray-600">
                        {books.filter(book => book.author === featuredContent.featured_author.author_name).length} books
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Author Photo Upload */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Upload Author Photo (Optional)</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                      {authorPhotoPreview ? (
                        <img
                          src={authorPhotoPreview}
                          alt="Author preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-gray-400 text-2xl" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAuthorPhotoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a photo for the featured author</p>
                  </div>
                </div>
              </div>

              {/* Authors List */}
              <div className="space-y-2">
                <h4 className="font-semibold">Select Featured Author</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {getUniqueAuthors().map((author) => {
                    const authorBooks = books.filter(book => book.author === author);
                    const isCurrentlyFeatured = featuredContent.featured_author?.author_name === author;
                    
                    return (
                      <button
                        key={author}
                        onClick={() => handleSetFeaturedAuthor(author)}
                        disabled={saving || uploadingPhoto || isCurrentlyFeatured}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          isCurrentlyFeatured
                            ? 'bg-orange-100 border-orange-300 text-orange-800'
                            : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        } disabled:opacity-50`}
                      >
                        <p className="font-semibold text-sm">{author}</p>
                        <p className="text-xs text-gray-600">{authorBooks.length} book(s)</p>
                        {isCurrentlyFeatured && (
                          <span className="text-xs text-orange-600 font-medium">Currently Featured</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Featured Books */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Current {tabs.find(t => t.id === activeTab)?.name}
                  </h3>
                  <span className="text-sm text-gray-600">
                    {getCurrentTypeData().length} of {getCurrentLimit()} selected
                  </span>
                </div>

                {getCurrentTypeData().length > 0 ? (
                  <div className="border rounded-lg overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Book
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Author
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getCurrentTypeData().map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="relative">
                                  <img
                                    src={`http://localhost:3000/${item.image_path}`}
                                    alt={item.title}
                                    className="h-12 w-8 object-cover rounded mr-3"
                                    onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
                                  />
                                  {/* Discount Badge */}
                                  {item.is_discount_active && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded text-center leading-none">
                                      %
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-gray-500">{item.genre}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* Price with Discount Display */}
                              {item.is_discount_active ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-green-600">
                                    ${item.discounted_price?.toFixed(2)}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <span className="line-through text-gray-400 text-xs">
                                      ${item.price}
                                    </span>
                                    <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                      -{item.discount_percentage}%
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="font-bold text-green-600">
                                  ${item.price}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.condition_rating}/10
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleRemoveFromFeatured(item.id, activeTab)}
                                disabled={saving}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                <FaTimes className="inline mr-1" />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                    <FaBookOpen className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg font-medium">No books selected for this section yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Select up to {getCurrentLimit()} books to feature in this section
                    </p>
                  </div>
                )}
              </div>

              {/* Available Books */}
              {getCurrentTypeData().length < getCurrentLimit() && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">
                      Add Books ({getAvailableBooks(activeTab).length} available)
                    </h4>
                  </div>

                  {/* Search and Sort Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search Books
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by title, author, or genre..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="price">Price</option>
                        <option value="condition_rating">Rating</option>
                        <option value="genre">Genre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>

                  {getAvailableBooks(activeTab).length > 0 ? (
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Book
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getAvailableBooks(activeTab).map((book) => (
                          <tr key={book.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="relative">
                                  <img
                                    src={`http://localhost:3000/${book.image_path}`}
                                    alt={book.title}
                                    className="h-12 w-8 object-cover rounded mr-3"
                                    onError={(e) => { e.target.src = '/assets/book1.jpg'; }}
                                  />
                                  {/* Discount Badge */}
                                  {book.is_discount_active && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded text-center leading-none">
                                      %
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {book.title}
                                  </p>
                                  <p className="text-sm text-gray-500">{book.genre}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.author}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {/* Price with Discount Display */}
                              {book.is_discount_active ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-green-600">
                                    ${book.discounted_price?.toFixed(2)}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    <span className="line-through text-gray-400 text-xs">
                                      ${book.price}
                                    </span>
                                    <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded">
                                      -{book.discount_percentage}%
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="font-bold text-green-600">
                                  ${book.price}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.condition_rating}/10
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleAddToFeatured(book.id, activeTab)}
                                disabled={saving}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                              >
                                <FaPlus className="inline mr-1" />
                                Add
                              </button>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border">
                      <FaBookOpen className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg font-medium">
                        {searchTerm ? 'No books found matching your search' : 'No books available to add'}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {searchTerm ? 'Try adjusting your search terms' : 'All books are already featured in this section'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturedContent; 