// frontend/src/components/Review/GameReviewer.jsx
import React, { useState } from 'react';
import Board from '../Board/Board';
import { Chess } from 'chess.js';

function GameReviewer() {
    const [pgn, setPgn] = useState('');
    const [currentGame, setCurrentGame] = useState(null);
    const [currentMove, setCurrentMove] = useState(0);

    const loadGame = () => {
        try {
            const game = new Chess();
            game.loadPgn(pgn);
            setCurrentGame(game);
            setCurrentMove(0);
        } catch (error) {
            alert('Invalid PGN format');
        }
    };

    const navigateMove = (direction) => {
        if (!currentGame) return;

        const newMove = currentMove + direction;
        if (newMove >= 0 && newMove <= currentGame.history().length) {
            const game = new Chess();
            const moves = currentGame.history();
            moves.slice(0, newMove).forEach(move => game.move(move));
            setCurrentGame(game);
            setCurrentMove(newMove);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* PGN Input Area */}
            <div className="mb-4">
                <textarea
                    className="w-full p-3 bg-gray-700 text-white rounded resize-none"
                    rows="4"
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                    placeholder="Paste PGN here..."
                />
                <button
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
                    onClick={loadGame}
                >
                    Load Game
                </button>
            </div>

            {/* Game Board + Controls */}
            {currentGame && (
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                        <Board position={currentGame.fen()} />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center">
                        <button
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            onClick={() => navigateMove(-1)}
                        >
                            Previous
                        </button>
                        <button
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                            onClick={() => navigateMove(1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameReviewer;