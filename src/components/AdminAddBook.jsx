import React, { useState } from 'react';
import { FaUpload, FaRobot, FaBook, FaCamera, FaTrash, FaPlus } from 'react-icons/fa';

const AdminAddBook = ({ onBookAdded }) => {
  const [activeMethod, setActiveMethod] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    genre: '',
    published_year: '',
    isbn: '',
    description: '',
    condition_rating: 7,
    on_sale: true
  });

  // Handle manual form submission (no images)
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || null,
          published_year: parseInt(formData.published_year) || null,
          condition_rating: parseInt(formData.condition_rating) || 7,
          imagePath: null, // No image for manual entry
          images: [], // No images for manual entry
          uploadDate: new Date().toISOString()
        }),
      });

      if (response.ok) {
        alert('Book added successfully!');
        setFormData({
          title: '',
          author: '',
          price: '',
          genre: '',
          published_year: '',
          isbn: '',
          description: '',
          condition_rating: 7,
          on_sale: true
        });
        onBookAdded();
      } else {
        alert('Failed to add book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book');
    } finally {
      setLoading(false);
    }
  };

  // Handle multiple AI image uploads
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('bookPhoto', file);

          const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (response.ok) {
            successCount++;
            console.log(`Successfully processed: ${result.bookDetails.title} by ${result.bookDetails.author}`);
          } else {
            errorCount++;
            console.error(`Failed to analyze ${file.name}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing ${file.name}:`, error);
        }
      }

      if (successCount > 0) {
        alert(`Successfully processed ${successCount} book(s)!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
        onBookAdded();
      } else {
        alert('Failed to process any images. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Choose Add Method</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveMethod('manual')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              activeMethod === 'manual'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaBook />
            <span>Manual Entry</span>
          </button>
          
          <button
            onClick={() => setActiveMethod('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
              activeMethod === 'ai'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaRobot />
            <span>AI Image Analysis</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Form - No Images */}
      {activeMethod === 'manual' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Add Book Manually</h3>
          <p className="text-sm text-gray-600 mb-6">Enter book details manually. No images will be uploaded in this mode.</p>
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Published Year
                </label>
                <input
                  type="number"
                  value={formData.published_year}
                  onChange={(e) => setFormData({...formData, published_year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.condition_rating}
                  onChange={(e) => setFormData({...formData, condition_rating: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Fiction, Mystery, Romance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter a brief description of the book..."
              />
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md font-medium ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-300 text-black'
                }`}
              >
                {loading ? 'Adding Book...' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Multiple Image Upload */}
      {activeMethod === 'ai' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">AI-Powered Book Addition</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FaRobot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Upload Multiple Book Cover Images
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Select multiple book cover images and our AI will automatically extract details for each book
            </p>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                    id="multiple-book-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="multiple-book-upload"
                    className={`inline-flex items-center space-x-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium cursor-pointer ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-400 text-black hover:bg-yellow-300'
                    }`}
                  >
                    <FaUpload />
                    <span>{loading ? 'Processing...' : 'Choose Multiple Images'}</span>
                  </label>
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                    id="multiple-camera-capture"
                    disabled={loading}
                  />
                  <label
                    htmlFor="multiple-camera-capture"
                    className={`inline-flex items-center space-x-2 px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium cursor-pointer ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <FaCamera />
                    <span>{loading ? 'Processing...' : 'Take Photos'}</span>
                  </label>
                </div>
              </div>
            </div>

            {loading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  AI is analyzing your book covers... This may take a moment for multiple images.
                </p>
              </div>
            )}

            <div className="mt-6 text-xs text-gray-500">
              <p><strong>Supported formats:</strong> JPG, PNG, WebP, GIF</p>
              <p><strong>Max file size:</strong> 10MB per image</p>
              <p><strong>Multiple uploads:</strong> Select multiple images to process them all at once</p>
              <p><strong>AI Features:</strong> Title, Author, Genre, Year detection for each book</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="text-sm font-medium text-blue-800 mb-2">How multiple image processing works:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select multiple book cover images at once</li>
              <li>• Our AI (GPT-4o) analyzes each image individually</li>
              <li>• Each book is automatically added to your inventory</li>
              <li>• You'll get a summary of successful and failed uploads</li>
              <li>• You can edit details later if needed</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddBook; 