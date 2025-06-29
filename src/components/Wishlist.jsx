import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ExternalLink } from 'lucide-react';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [addingToCart, setAddingToCart] = useState(new Set());

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/wishlist', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/wishlist/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setWishlist(wishlist.filter(item => item.book_id !== bookId));
                setMessage('Item removed from wishlist');
            } else {
                setMessage('Failed to remove item from wishlist');
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            setMessage('Failed to remove item from wishlist');
        }
    };

    const addToCart = async (bookId) => {
        setAddingToCart(prev => new Set(prev).add(bookId));

        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId, quantity: 1 })
            });

            if (response.ok) {
                setMessage('Item added to cart');
            } else {
                setMessage('Failed to add item to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            setMessage('Failed to add item to cart');
        } finally {
            setAddingToCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
        }
    };

    const moveToCart = async (bookId) => {
        setAddingToCart(prev => new Set(prev).add(bookId));

        try {
            // Add to cart
            const cartResponse = await fetch('http://localhost:3000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId, quantity: 1 })
            });

            if (cartResponse.ok) {
                // Remove from wishlist
                await removeFromWishlist(bookId);
                setMessage('Item moved to cart');
            } else {
                setMessage('Failed to move item to cart');
            }
        } catch (error) {
            console.error('Move to cart error:', error);
            setMessage('Failed to move item to cart');
        } finally {
            setAddingToCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="space-y-4">
                                <div className="h-48 bg-gray-200 rounded-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Heart className="h-6 w-6 mr-2 text-red-500" />
                    My Wishlist ({wishlist.length} items)
                </h2>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg ${
                        message.includes('added') || message.includes('moved') || message.includes('removed')
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="p-6">
                {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 mb-6">Save books you love for later!</p>
                        <a
                            href="/shop"
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                        >
                            Browse Books
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div key={item.book_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Book Image */}
                                <div className="aspect-[3/4] bg-gray-200 relative group">
                                                                            {item.image_path ? (
                                            <img
                                                src={`http://localhost:3000/${item.image_path}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}

                                    {/* Discount Badge */}
                                    {item.is_discount_active && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                {item.discount_percentage}% OFF
                                            </span>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromWishlist(item.book_id)}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>

                                {/* Book Details */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2" title={item.title}>
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">by {item.author}</p>

                                    {/* Price */}
                                    <div className="mb-4">
                                        {item.is_discount_active ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-bold text-gray-900">
                                                    ${item.discounted_price.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-gray-500 line-through">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-900">
                                                ${item.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => moveToCart(item.book_id)}
                                            disabled={addingToCart.has(item.book_id)}
                                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {addingToCart.has(item.book_id) ? (
                                                'Adding...'
                                            ) : (
                                                <>
                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                    Move to Cart
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => addToCart(item.book_id)}
                                            disabled={addingToCart.has(item.book_id)}
                                            className="w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>

                                    {/* Added to wishlist date */}
                                    <div className="mt-3 text-xs text-gray-500">
                                        Added {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist; 