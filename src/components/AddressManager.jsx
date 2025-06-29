import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, CheckCircle, Home, Building } from 'lucide-react';

const AddressManager = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        address_type: 'shipping',
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        is_default: false
    });

    const states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/addresses', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const url = editingAddress ? `http://localhost:3000/api/addresses/${editingAddress.id}` : 'http://localhost:3000/api/addresses';
            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
                await fetchAddresses();
                resetForm();
            } else {
                setMessage(data.error || 'Failed to save address');
            }
        } catch (error) {
            console.error('Address save error:', error);
            setMessage('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setMessage('Address deleted successfully!');
                await fetchAddresses();
            } else {
                setMessage('Failed to delete address');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            setMessage('Failed to delete address');
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            address_type: address.address_type,
            full_name: address.full_name,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone || '',
            is_default: Boolean(address.is_default)
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            address_type: 'shipping',
            full_name: '',
            address_line1: '',
            address_line2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US',
            phone: '',
            is_default: false
        });
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Addresses</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                    message.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            {/* Address Form */}
            {showForm && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Type
                                </label>
                                <select
                                    name="address_type"
                                    value={formData.address_type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="shipping">Shipping</option>
                                    <option value="billing">Billing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 1 *
                                </label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State *
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select State</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal Code *
                                </label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Make this my default address
                            </label>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            <div className="space-y-4">
                {addresses.length === 0 ? (
                    <div className="text-center py-12">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No addresses found. Add your first address!</p>
                    </div>
                ) : (
                    addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        {address.address_type === 'shipping' ? (
                                            <Home className="h-4 w-4 mr-2 text-blue-600" />
                                        ) : (
                                            <Building className="h-4 w-4 mr-2 text-green-600" />
                                        )}
                                        <span className="font-medium text-gray-900 capitalize">
                                            {address.address_type} Address
                                        </span>
                                        {address.is_default && (
                                            <span className="ml-2 flex items-center text-green-600 text-sm">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-gray-700">
                                        <p className="font-medium">{address.full_name}</p>
                                        <p>{address.address_line1}</p>
                                        {address.address_line2 && <p>{address.address_line2}</p>}
                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                        <p>{address.country}</p>
                                        {address.phone && <p>Phone: {address.phone}</p>}
                                    </div>
                                </div>

                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit address"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete address"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddressManager; 