// frontend/src/components/Pieces/Piece.js
import React from 'react';
import { motion } from 'framer-motion';

function Piece({ type }) {
    return (
        <motion.div
            className="absolute inset-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
        >
            <img
                src={`/pieces/${type}.svg`}
                alt={type}
                className="w-full h-full object-contain"
            />
        </motion.div>
    );
}

export default Piece;