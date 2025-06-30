import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AddressManager from '../components/AddressManager';
import ShoppingCart from '../components/ShoppingCart';
import Wishlist from '../components/Wishlist';
import PasswordChange from '../components/PasswordChange';
import { User, MapPin, ShoppingCart as CartIcon, Heart, Lock, Package } from 'lucide-react';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Handle URL parameters for tab switching
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'addresses', 'cart', 'wishlist', 'orders', 'password'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Update profile data when user data changes
    useEffect(() => {
        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const tabs = [
        { id: 'profile', label: 'Profile Info', icon: User },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'cart', label: 'Shopping Cart', icon: CartIcon },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'password', label: 'Security', icon: Lock }
    ];

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);

            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.status === 401 || response.status === 403) {
                setMessage('Your session has expired. Please log in again.');
                return;
            }

            // Check if response has content before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON response');
            }

            const responseText = await response.text();
            console.log('Response text:', responseText);

            if (!responseText) {
                throw new Error('Empty response from server');
            }

            const data = JSON.parse(responseText);

            if (response.ok) {
                setMessage('Profile updated successfully!');
                updateUser(data.user);
                // Update profile data in state
                setProfileData({
                    first_name: data.user.first_name || '',
                    last_name: data.user.last_name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || ''
                });
            } else {
                setMessage(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.message.includes('JSON')) {
                setMessage('Server error - please try again or contact support');
            } else {
                setMessage('Failed to update profile');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                        
                        {message && (
                            <div className={`mb-4 p-4 rounded-lg ${
                                message.includes('successfully') 
                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium">Username:</span> {user?.username}</p>
                                    <p><span className="font-medium">Role:</span> {user?.role}</p>
                                    <p><span className="font-medium">Member since:</span> {new Date(user?.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'addresses':
                return <AddressManager />;

            case 'cart':
                return <ShoppingCart />;

            case 'wishlist':
                return <Wishlist />;

            case 'password':
                return <PasswordChange />;

            case 'orders':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">Order history feature coming soon!</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                        <p className="text-gray-600 mt-2">Manage your profile, addresses, and preferences</p>
                    </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                                                activeTab === tab.id
                                                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5 mr-3" />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default UserProfile; 