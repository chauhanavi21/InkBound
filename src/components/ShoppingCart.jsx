import React, { useState, useEffect } from 'react';
import { ShoppingCart as CartIcon, Minus, Plus, Trash2, Heart, ArrowRight } from 'lucide-react';

const ShoppingCart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [updatingItems, setUpdatingItems] = useState(new Set());

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCart(data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (bookId, newQuantity) => {
        setUpdatingItems(prev => new Set(prev).add(bookId));

        try {
            const response = await fetch(`http://localhost:3000/api/cart/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (response.ok) {
                if (newQuantity === 0) {
                    setCart(cart.filter(item => item.book_id !== bookId));
                } else {
                    setCart(cart.map(item => 
                        item.book_id === bookId 
                        ? { ...item, quantity: newQuantity }
                        : item
                    ));
                }
            } else {
                setMessage('Failed to update quantity');
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            setMessage('Failed to update quantity');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookId);
                return newSet;
            });
        }
    };

    const removeFromCart = async (bookId) => {
        await updateQuantity(bookId, 0);
    };

    const moveToWishlist = async (bookId) => {
        try {
            // Add to wishlist
            const wishlistResponse = await fetch('http://localhost:3000/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId })
            });

            if (wishlistResponse.ok) {
                // Remove from cart
                await removeFromCart(bookId);
                setMessage('Item moved to wishlist');
            } else {
                setMessage('Failed to move item to wishlist');
            }
        } catch (error) {
            console.error('Move to wishlist error:', error);
            setMessage('Failed to move item to wishlist');
        }
    };

    const clearCart = async () => {
        if (!confirm('Are you sure you want to clear your cart?')) return;

        try {
            const response = await fetch('http://localhost:3000/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setCart([]);
                setMessage('Cart cleared successfully');
            } else {
                setMessage('Failed to clear cart');
            }
        } catch (error) {
            console.error('Clear cart error:', error);
            setMessage('Failed to clear cart');
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.is_discount_active ? item.discounted_price : item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateSavings = () => {
        return cart.reduce((savings, item) => {
            if (item.is_discount_active) {
                const discount = (item.price - item.discounted_price) * item.quantity;
                return savings + discount;
            }
            return savings;
        }, 0);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex space-x-4">
                                <div className="h-24 bg-gray-200 rounded w-20"></div>
                                <div className="flex-1 space-y-2">
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
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <CartIcon className="h-6 w-6 mr-2" />
                        Shopping Cart ({cart.length} items)
                    </h2>
                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg ${
                        message.includes('successfully') || message.includes('moved') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}
            </div>

            <div className="p-6">
                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <CartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Add some books to get started!</p>
                        <a
                            href="/shop"
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                        >
                            Continue Shopping
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.book_id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    {/* Book Image */}
                                    <div className="w-20 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image_path ? (
                                            <img
                                                src={`http://localhost:3000/${item.image_path}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-gray-500 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Book Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                                        <p className="text-sm text-gray-600">by {item.author}</p>
                                        
                                        <div className="flex items-center space-x-2 mt-2">
                                            {item.is_discount_active && (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                    {item.discount_percentage}% OFF
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 mt-3">
                                            <button
                                                onClick={() => moveToWishlist(item.book_id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                            >
                                                <Heart className="h-4 w-4 mr-1" />
                                                Move to Wishlist
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.book_id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || updatingItems.has(item.book_id)}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="px-4 py-2 text-center min-w-[60px]">
                                                {updatingItems.has(item.book_id) ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                                                disabled={updatingItems.has(item.book_id)}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right min-w-[100px]">
                                        {item.is_discount_active ? (
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    ${item.discounted_price.toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-500 line-through">
                                                    ${item.price.toFixed(2)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-lg font-bold text-gray-900">
                                                ${item.price.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart.length} items)</span>
                                        <span>${(calculateTotal() + calculateSavings()).toFixed(2)}</span>
                                    </div>
                                    
                                    {calculateSavings() > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Savings</span>
                                            <span>-${calculateSavings().toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">FREE</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-300 pt-2">
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                                    onClick={() => alert('Checkout functionality coming soon!')}
                                >
                                    Proceed to Checkout
                                </button>

                                <div className="mt-4 text-center">
                                    <a
                                        href="/shop"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Continue Shopping
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingCart; 