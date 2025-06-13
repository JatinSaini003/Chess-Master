// components/UI/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Icon library (tailwind friendly)
import wQ from '../../assets/pieces/wQ.svg';

function Navbar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'bg-gray-700' : '';

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={wQ} alt="Chess Logo" className="h-10 w-10 mr-2" />
                        <span className="text-white text-xl font-bold">Chess Master</span>
                    </Link>

                    {/* Mobile toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-300 hover:text-white focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex space-x-4">
                        <NavLinks isActive={isActive} />
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden flex flex-col space-y-2 mt-2 pb-4">
                        <NavLinks isActive={isActive} />
                    </div>
                )}
            </div>
        </nav>
    );
}

// Separate nav links to avoid duplication
const NavLinks = ({ isActive }) => (
    <>
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
    </>
);

export default Navbar;
