import React from 'react';
import { FaHome, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleBackToSite = () => {
    navigate('/');
  };

  return (
    <nav className="bg-[#131921] text-white py-5 px-4 border-b border-gray-700">
      <div className="max-w-[95rem] mx-auto flex items-center justify-between">
        {/* Left: Logo and Admin Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-semibold">InkBound</span>
            <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
              ADMIN
            </span>
          </div>
        </div>

        {/* Center: Admin Title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-medium">Administration Dashboard</h1>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToSite}
            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
            title="Back to main site"
          >
            <FaHome className="text-lg" />
            <span className="hidden md:inline">Back to Site</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors">
            <FaCog className="text-lg" />
            <span className="hidden md:inline">Settings</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-600 transition-colors">
            <FaSignOutAlt className="text-lg" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 