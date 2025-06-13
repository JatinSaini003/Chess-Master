// components/Board/Square.js
import React from 'react';
import { motion } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';

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

function Square({
    isLight,
    piece,
    square,
    isSelected,
    isValidMove,
    isLastMove,
    isChecked,
    onClick,
    onDrop
}) {
    // Drag setup
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'piece',
        item: { piece, square },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [piece, square]);

    // Drop setup
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'piece',
        drop: (item) => onDrop(item.square, square),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [square, onDrop]);

    // Combine refs
    const dragDropRef = (node) => {
        drag(drop(node));
    };

    return (
        <div
            ref={piece ? dragDropRef : drop}
            onClick={onClick}
            className={`
        aspect-square relative cursor-pointer transition-all
        ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
        ${isSelected ? 'border-2 border-yellow-400' : ''}
        ${isLastMove ? 'bg-yellow-200 bg-opacity-50' : ''}
        ${isChecked ? 'border-4 border-red-500 border-opacity-80' : ''}
        ${isOver ? 'bg-blue-200 bg-opacity-50' : ''}
        hover:opacity-90
      `}
        >
            {piece && !isDragging && (
                <motion.img
                    key={piece}
                    src={pieceImages[piece]}
                    alt={piece}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    draggable={false}
                    className={`absolute w-full h-full p-[2px] sm:p-1 md:p-1.5 ${isChecked ? 'animate-pulse' : ''}`}
                />
            )}

            {isValidMove && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={piece
                        ? `w-full h-full border-4 ${isValidMove ? 'border-green-500' : 'border-gray-500'} opacity-50`
                        : `w-[18%] h-[18%] sm:w-[14%] sm:h-[14%] rounded-full ${isValidMove ? 'bg-green-500' : 'bg-gray-500'} opacity-60`}
                    />
                </div>
            )}
        </div>
    );
}

export default Square;