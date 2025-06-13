// components/Board/DraggablePiece.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';

import wP from '../../assets/pieces/wP.svg';
import wR from '../../assets/pieces/wR.svg';
import wN from '../../assets/pieces/wN.svg';
import wB from '../../assets/pieces/wB.svg';
import wQ from '../../assets/pieces/wQ.svg';
import wK from '../../assets/pieces/wK.svg';
import bP from '../../assets/pieces/bP.svg';
import bR from '../../assets/pieces/bR.svg';
import bN from '../../assets/pieces/bN.svg';
import bB from '../../assets/pieces/bB.svg';
import bQ from '../../assets/pieces/bQ.svg';
import bK from '../../assets/pieces/bK.svg';


const pieceImages = {
    'P': wP,
    'R': wR,
    'N': wN,
    'B': wB,
    'Q': wQ,
    'K': wK,
    'p': bP,
    'r': bR,
    'n': bN,
    'b': bB,
    'q': bQ,
    'k': bK,
};

function DraggablePiece({ piece, square, pieceImages, isChecked }) {
    const [{ isDragging }, drag] = useDrag({
        type: 'piece',
        item: { piece, square },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <motion.div
            ref={drag}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`absolute inset-0 cursor-grab ${isDragging ? 'opacity-50' : ''}`}
        >
            <img
                src={pieceImages[piece]}
                alt={piece}
                className={`w-full h-full p-0.5 ${isChecked ? 'animate-pulse' : ''}`}
                draggable={false}
            />
        </motion.div>
    );
}

export default DraggablePiece;