import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const PasswordChange = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 6,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        return requirements;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }

        // Clear message when user starts typing
        if (message) setMessage('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'New password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password changed successfully!');
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setMessage(data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            setMessage('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const passwordRequirements = validatePassword(formData.newPassword);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
                <Lock className="h-6 w-6 mr-2 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('successfully') 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your current password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.newPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}

                    {/* Password Requirements */}
                    {formData.newPassword && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                            <div className="space-y-1">
                                <div className={`flex items-center text-xs ${
                                    passwordRequirements.length ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {passwordRequirements.length ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    At least 6 characters
                                </div>
                                <div className={`flex items-center text-xs ${
                                    passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {passwordRequirements.lowercase ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    One lowercase letter
                                </div>
                                <div className={`flex items-center text-xs ${
                                    passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {passwordRequirements.uppercase ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    One uppercase letter
                                </div>
                                <div className={`flex items-center text-xs ${
                                    passwordRequirements.number ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {passwordRequirements.number ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    One number
                                </div>
                                <div className={`flex items-center text-xs ${
                                    passwordRequirements.special ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {passwordRequirements.special ? (
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    One special character
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Confirm your new password"
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-start">
                    <button
                        type="submit"
                        disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                </div>
            </form>

            {/* Security Tips */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Security Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a unique password that you don't use on other websites</li>
                    <li>• Consider using a password manager to generate and store strong passwords</li>
                    <li>• Change your password regularly, especially if you suspect it may be compromised</li>
                    <li>• Never share your password with anyone</li>
                </ul>
            </div>
        </div>
    );
};

export default PasswordChange; 