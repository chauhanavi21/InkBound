import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaPercentage } from 'react-icons/fa';

const AdminBookTable = ({ books, onRefresh, loading }) => {
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [discountBook, setDiscountBook] = useState(null);

  const handleEdit = (book) => {
    setEditingBook(book);
  };

  const handleSaveEdit = async (bookId, updates) => {
    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setEditingBook(null);
        onRefresh();
      } else {
        alert('Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Error updating book');
    }
  };

  const handleDelete = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteConfirm(null);
        onRefresh();
      } else {
        alert('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Error deleting book');
    }
  };

  const toggleSaleStatus = async (book) => {
    await handleSaveEdit(book.id, { on_sale: !book.on_sale });
  };

  const handleDiscount = (book) => {
    setDiscountBook(book);
  };

  const handleSaveDiscount = async (bookId, discountData) => {
    await handleSaveEdit(bookId, discountData);
    setDiscountBook(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">All Books ({books.length})</h3>
          <button
            onClick={onRefresh}
            className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-md font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No books found. Add your first book to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative">
                        {/* Discount indicator overlay on image */}
                        {book.is_discount_active && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                            %
                          </div>
                        )}
                        
                        {book.images && book.images.length > 0 ? (
                          <div className="flex space-x-1">
                            <img
                              src={`http://localhost:3000/${book.images[0]}`}
                              alt={book.title}
                              className="h-16 w-12 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/assets/book1.jpg';
                              }}
                            />
                            {book.images.length > 1 && (
                              <div className="flex flex-col space-y-1">
                                {book.images.slice(1, 3).map((imagePath, index) => (
                                  <img
                                    key={index}
                                    src={`http://localhost:3000/${imagePath}`}
                                    alt={`${book.title} ${index + 2}`}
                                    className="h-7 w-5 object-cover rounded"
                                    onError={(e) => {
                                      e.target.src = '/assets/book1.jpg';
                                    }}
                                  />
                                ))}
                                {book.images.length > 3 && (
                                  <div className="h-7 w-5 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-xs text-gray-600">+{book.images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <img
                            src={book.image_path ? `http://localhost:3000/${book.image_path}` : '/assets/book1.jpg'}
                            alt={book.title}
                            className="h-16 w-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/assets/book1.jpg';
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {book.title}
                          </div>
                          {/* Discount Status Badge */}
                          {book.discount_percentage > 0 && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              book.is_discount_active ? 
                                'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                              {book.is_discount_active ? 
                                `${book.discount_percentage}% OFF` : 
                                'Expired'
                              }
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                        {book.images && book.images.length > 1 && (
                          <div className="text-xs text-blue-600">
                            {book.images.length} images
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div><strong>Genre:</strong> {book.genre || 'N/A'}</div>
                      <div><strong>Year:</strong> {book.published_year || 'N/A'}</div>
                      <div><strong>ISBN:</strong> {book.isbn || 'N/A'}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {/* Price Display with Discount */}
                      <div className="flex items-center space-x-2">
                        {book.is_discount_active ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              ${book.discounted_price?.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              ${book.price || '0.00'}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              -{book.discount_percentage}%
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-green-600">
                            ${book.price || '0.00'}
                          </span>
                        )}
                      </div>
                      
                      {/* Discount Status */}
                      {book.discount_percentage > 0 && book.discount_end_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          {book.is_discount_active ? (
                            <>Until {new Date(book.discount_end_date).toLocaleDateString()}</>
                          ) : (
                            <span className="text-red-500">Discount expired</span>
                          )}
                        </div>
                      )}
                      
                      {/* Sale Status Toggle */}
                      <button
                        onClick={() => toggleSaleStatus(book)}
                        className="flex items-center space-x-2 mt-2"
                      >
                        {book.on_sale ? (
                          <FaToggleOn className="text-green-500 text-lg" />
                        ) : (
                          <FaToggleOff className="text-gray-400 text-lg" />
                        )}
                        <span className={`text-xs ${book.on_sale ? 'text-green-600' : 'text-gray-400'}`}>
                          {book.on_sale ? 'On Sale' : 'Off Sale'}
                        </span>
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(book.condition_rating / 2))}
                        {'☆'.repeat(5 - Math.floor(book.condition_rating / 2))}
                      </span>
                      <span className="ml-2 text-gray-600">
                        {book.condition_rating}/10
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Edit Book"
                      >
                        <FaEdit />
                      </button>
                      
                      <button
                        onClick={() => handleDiscount(book)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Manage Discount"
                      >
                        <FaPercentage />
                      </button>
                      
                      <button
                        onClick={() => setDeleteConfirm(book.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Book"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onSave={handleSaveEdit}
          onCancel={() => setEditingBook(null)}
        />
      )}

      {/* Discount Modal */}
      {discountBook && (
        <DiscountModal
          book={discountBook}
          onSave={handleSaveDiscount}
          onCancel={() => setDiscountBook(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          bookId={deleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

// Discount Modal Component
const DiscountModal = ({ book, onSave, onCancel }) => {
  const [discountPercentage, setDiscountPercentage] = useState(book.discount_percentage || 0);
  const [discountEndDate, setDiscountEndDate] = useState(
    book.discount_end_date ? book.discount_end_date.split('T')[0] : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updates = {
      discount_percentage: parseFloat(discountPercentage) || 0,
      discount_end_date: discountEndDate || null
    };
    
    onSave(book.id, updates);
  };

  const removeDiscount = () => {
    onSave(book.id, { discount_percentage: 0, discount_end_date: null });
  };

  const calculateDiscountedPrice = () => {
    if (discountPercentage > 0 && book.price) {
      return (book.price * (1 - discountPercentage / 100)).toFixed(2);
    }
    return book.price?.toFixed(2) || '0.00';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4 text-green-600">Manage Discount</h3>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Book: <strong>{book.title}</strong></div>
          <div className="text-sm text-gray-600">Current Price: <strong>${book.price || '0.00'}</strong></div>
          {book.discount_percentage > 0 && (
            <div className="text-sm text-green-600">
              Current Discount: <strong>{book.discount_percentage}%</strong>
              {book.discount_end_date && (
                <span> (until {new Date(book.discount_end_date).toLocaleDateString()})</span>
              )}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Percentage (0-99%)
            </label>
            <input
              type="number"
              min="0"
              max="99"
              step="0.1"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter discount percentage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount End Date (Optional)
            </label>
            <input
              type="date"
              value={discountEndDate}
              onChange={(e) => setDiscountEndDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for permanent discount
            </p>
          </div>

          {/* Price Preview */}
          {discountPercentage > 0 && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-sm text-green-800">
                <strong>Price Preview:</strong>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="line-through text-gray-500">${book.price || '0.00'}</span>
                <span className="text-green-600 font-bold">${calculateDiscountedPrice()}</span>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                  -{discountPercentage}% OFF
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between space-x-3 pt-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              
              {book.discount_percentage > 0 && (
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove Discount
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
            >
              Apply Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Book Modal Component
const EditBookModal = ({ book, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    price: book.price || '',
    genre: book.genre || '',
    published_year: book.published_year || '',
    isbn: book.isbn || '',
    description: book.description || '',
    condition_rating: book.condition_rating || 5,
    on_sale: book.on_sale || false,
    discount_percentage: book.discount_percentage || 0,
    discount_end_date: book.discount_end_date ? book.discount_end_date.split('T')[0] : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(book.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Edit Book</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={formData.published_year}
                onChange={(e) => setFormData({...formData, published_year: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.condition_rating}
                onChange={(e) => setFormData({...formData, condition_rating: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({...formData, genre: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Discount Section */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-800 mb-3">Discount Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount End Date
                </label>
                <input
                  type="date"
                  value={formData.discount_end_date}
                  onChange={(e) => setFormData({...formData, discount_end_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="on_sale"
              checked={formData.on_sale}
              onChange={(e) => setFormData({...formData, on_sale: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="on_sale" className="text-sm font-medium text-gray-700">
              Available for sale
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-300 font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ bookId, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4 text-red-600">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this book? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(bookId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookTable; 