// frontend/src/components/Review/GameReviewer.js
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
            <div className="mb-4">
                <textarea
                    className="w-full p-2 bg-gray-700 text-white rounded"
                    rows="4"
                    value={pgn}
                    onChange={(e) => setPgn(e.target.value)}
                    placeholder="Paste PGN here..."
                />
                <button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={loadGame}
                >
                    Load Game
                </button>
            </div>

            {currentGame && (
                <div className="flex flex-col items-center">
                    <Board position={currentGame.fen()} />
                    <div className="mt-4 flex gap-4">
                        <button
                            className="bg-gray-700 text-white px-4 py-2 rounded"
                            onClick={() => navigateMove(-1)}
                        >
                            Previous
                        </button>
                        <button
                            className="bg-gray-700 text-white px-4 py-2 rounded"
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