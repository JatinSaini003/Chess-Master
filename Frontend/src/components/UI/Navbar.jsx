// components/UI/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import wQ from '../../assets/pieces/wQ.svg';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-gray-700' : '';
    };

    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center">
                        <img
                            src={wQ}
                            alt="Chess Logo"
                            className="h-10 w-10 mr-2"
                        />
                        <span className="text-white text-xl font-bold">Chess Master</span>
                    </Link>

                    <div className="flex space-x-4">
                        <Link
                            to="/"
                            className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/play"
                            className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/play')}`}
                        >
                            Play
                        </Link>
                        <Link
                            to="/analysis"
                            className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/analysis')}`}
                        >
                            Analysis
                        </Link>
                        <Link
                            to="/pgn-import"
                            className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${isActive('/pgn-import')}`}
                        >
                            Import Game
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;