import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Star, ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/books/${id}`);
            
            if (response.ok) {
                const bookData = await response.json();
                setBook(bookData);
            } else if (response.status === 404) {
                setError('Book not found');
            } else {
                setError('Failed to load book details');
            }
        } catch (error) {
            console.error('Error fetching book:', error);
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        if (!user) {
            setMessage('Please log in to add items to cart');
            return;
        }

        setAddingToCart(true);
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId: parseInt(id), quantity: 1 })
            });

            if (response.ok) {
                setMessage('Book added to cart successfully!');
            } else {
                setMessage('Failed to add book to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            setMessage('Failed to add book to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const addToWishlist = async () => {
        if (!user) {
            setMessage('Please log in to add items to wishlist');
            return;
        }

        setAddingToWishlist(true);
        try {
            const response = await fetch('http://localhost:3000/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId: parseInt(id) })
            });

            if (response.ok) {
                setMessage('Book added to wishlist!');
            } else {
                setMessage('Failed to add book to wishlist');
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            setMessage('Failed to add book to wishlist');
        } finally {
            setAddingToWishlist(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400/50 text-yellow-400" />);
            } else {
                stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
            }
        }

        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                    <span className="ml-2 text-gray-600">Loading book details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto py-12 px-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/shop')}
                    className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Shop
                </button>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.includes('successfully') || message.includes('added')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                        {/* Book Image */}
                        <div className="lg:w-1/3 p-8">
                            <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                                {book.image_path ? (
                                    <img
                                        src={`http://localhost:3000/${book.image_path}`}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-gray-500">No Image Available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Book Details */}
                        <div className="lg:w-2/3 p-8">
                            <div className="mb-4">
                                {book.is_discount_active && (
                                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                                        {book.discount_percentage}% OFF
                                    </span>
                                )}
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
                            </div>

                            {/* Rating */}
                            {book.condition_rating && (
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center mr-2">
                                        {renderStars(book.condition_rating)}
                                    </div>
                                    <span className="text-gray-600">
                                        ({book.condition_rating}/5 condition rating)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                {book.is_discount_active ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-3xl font-bold text-gray-900">
                                            ${book.discounted_price.toFixed(2)}
                                        </span>
                                        <span className="text-xl text-gray-500 line-through">
                                            ${book.price.toFixed(2)}
                                        </span>
                                        <span className="text-green-600 font-medium">
                                            Save ${(book.price - book.discounted_price).toFixed(2)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-gray-900">
                                        ${book.price.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {book.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">{book.description}</p>
                                </div>
                            )}

                            {/* Book Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {book.genre && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Genre</span>
                                        <p className="text-gray-900">{book.genre}</p>
                                    </div>
                                )}
                                {book.published_year && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Published</span>
                                        <p className="text-gray-900">{book.published_year}</p>
                                    </div>
                                )}
                                {book.isbn && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">ISBN</span>
                                        <p className="text-gray-900">{book.isbn}</p>
                                    </div>
                                )}
                                {book.condition_rating && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Condition</span>
                                        <p className="text-gray-900">{book.condition_rating}/10</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={addToCart}
                                    disabled={addingToCart}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                                >
                                    {addingToCart ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                    )}
                                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={addToWishlist}
                                    disabled={addingToWishlist}
                                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                                >
                                    {addingToWishlist ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : (
                                        <Heart className="h-5 w-5 mr-2" />
                                    )}
                                    {addingToWishlist ? 'Adding...' : 'Add to Wishlist'}
                                </button>
                            </div>

                            {/* Shipping Info */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
                                <p className="text-sm text-gray-600">
                                    Free shipping on all orders. Estimated delivery: 3-5 business days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
