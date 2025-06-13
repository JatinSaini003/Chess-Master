// components/Game/GameOverModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function GameOverModal({ isOpen, result, onNewGame, onAcceptDraw, onDeclineDraw, isDraw }) {
    const navigate = useNavigate();
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                >
                    <h2 className="text-2xl text-white font-bold mb-4">
                        {isDraw ? "Draw Offer" : "Game Over"}
                    </h2>
                    <p className="text-xl text-white mb-6">{result}</p>

                    {isDraw ? (
                        <div className="flex gap-4">
                            <button
                                onClick={onAcceptDraw}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                Accept Draw
                            </button>
                            <button
                                onClick={onDeclineDraw}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/analysis')}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                Analyze Game
                            </button>
                            <button
                                onClick={onNewGame}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
                            >
                                New Game
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default React.memo(GameOverModal);