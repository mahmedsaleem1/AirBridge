import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/auth.slice';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Left Side - Brand Logo */}
                    <div className="flex-shrink-0">
                        <button 
                            onClick={() => navigate('/')}
                            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                            AirBridge
                        </button>
                    </div>

                    {/* Middle Section - Navigation Links */}
                    <nav className="hidden md:flex space-x-8">
                    <button
                        onClick={() => navigate('/')}
                        className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/upload')}
                        className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                    >
                        Upload
                    </button>
                    <button
                        onClick={() => navigate('/about')}
                        className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                    >
                        About 
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                    >
                        Contact
                    </button>

                </nav>

                    {/* Right Side - Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                {/* User Info */}
                                <div className="flex items-center space-x-2">
                                    {user.photoURL && (
                                        <img 
                                            src={user.photoURL} 
                                            alt={user.displayName || 'User'} 
                                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                                        />
                                    )}
                                    <span className="text-gray-700 text-sm font-medium hidden sm:block">
                                        {user.displayName || user.email}
                                    </span>
                                </div>
                                
                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                {/* Login Button */}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
                                >
                                    Login
                                </button>
                                
                                {/* Signup Button */}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            className="text-gray-700 hover:text-blue-600 inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu (Hidden by default) */}
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 hover:bg-blue-50"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 hover:bg-blue-50"
                        >
                            About
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 hover:bg-blue-50"
                        >
                            Contact 
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/upload')}
                            className="relative bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md transform hover:scale-105"
                        >
                            Upload
                        </button>
                        
                        {!user && (
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 hover:bg-blue-50"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 mt-2"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;