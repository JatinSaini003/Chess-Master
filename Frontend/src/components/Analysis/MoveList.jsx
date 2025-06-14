import React from 'react';
import { useChess } from '../../context/chessContext';
import { motion, AnimatePresence } from 'framer-motion';

function MoveList({ moves }) {
  const { state, dispatch } = useChess();

  const handleMoveClick = (moveIndex) => {
    dispatch({ type: 'GO_TO_MOVE', payload: moveIndex });
  };

  const formatMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhiteMove = index % 2 === 0;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center p-2 cursor-pointer
          ${state.currentMove === index + 1 ? 'bg-blue-600' : 'hover:bg-gray-700'}
          rounded-md transition-colors
        `}
        onClick={() => handleMoveClick(index + 1)}
      >
        {isWhiteMove && (
          <span className="text-gray-400 mr-2 text-xs sm:text-sm">{moveNumber}.</span>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-white font-mono text-sm sm:text-base">{move.san}</span>
          {move.flags && (
            <MoveAnnotation flags={move.flags} />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
      <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">Move List</h3>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <AnimatePresence>
            {moves.map((move, index) => formatMove(move, index))}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
        <ControlButton
          onClick={() => dispatch({ type: 'GO_TO_START' })}
          disabled={state.currentMove === 0}
        >
          ⏮️ Start
        </ControlButton>
        <ControlButton
          onClick={() => dispatch({ type: 'PREV_MOVE' })}
          disabled={state.currentMove === 0}
        >
          ⬅️ Previous
        </ControlButton>
        <ControlButton
          onClick={() => dispatch({ type: 'NEXT_MOVE' })}
          disabled={state.currentMove === moves.length}
        >
          Next ➡️
        </ControlButton>
        <ControlButton
          onClick={() => dispatch({ type: 'GO_TO_END' })}
          disabled={state.currentMove === moves.length}
        >
          End ⏭️
        </ControlButton>
      </div>
    </div>
  );
}

function MoveAnnotation({ flags }) {
  const annotations = {
    'n': '♞', // Knight promotion
    'b': '♝', // Bishop promotion
    'r': '♜', // Rook promotion
    'q': '♛', // Queen promotion
    'k': '♔', // King-side castling
    'e': 'ep', // En passant
    'c': 'x',  // Capture
    '+': '+',  // Check
    '#': '#',  // Checkmate
  };

  return (
    <span className="text-yellow-400 text-xs sm:text-sm">
      {flags.split('').map(flag => annotations[flag] || flag).join(' ')}
    </span>
  );
}

function ControlButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full sm:w-auto text-sm sm:text-base px-3 py-2 rounded-md
        ${disabled
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'}
        transition-colors
      `}
    >
      {children}
    </button>
  );
}

export default MoveList;
