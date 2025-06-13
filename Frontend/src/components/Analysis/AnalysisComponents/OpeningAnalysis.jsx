import React, { useState, useEffect, useMemo } from 'react';
import {
    identifyOpening,
    getOpeningSuggestions,
    OPENINGS_DATABASE
} from '../../../Data/openings';
import {
    BookOpenIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/solid';
import { useChess } from '../../../context/chessContext';
import { Chess } from 'chess.js';

// Strategic Suggestion Generator
const generateStrategicSuggestions = (game) => {
    const strategicInsights = [
        {
            category: 'Piece Development',
            strategies: [
                {
                    name: 'Knight Development',
                    condition: (game) => {
                        const knights = ['Nf3', 'Nc3', 'Nd2', 'Na3', 'Nf6', 'Nc6', 'Nd7'];
                        const developedKnights = knights.filter(move =>
                            game.history().includes(move)
                        );
                        return developedKnights.length < 2;
                    },
                    suggestion: 'Develop a knight to a central square',
                    moves: ['Nf3', 'Nc3', 'Nf6', 'Nc6'],
                    icon: '♘',
                    priority: 0.8
                },
                {
                    name: 'Bishop Development',
                    condition: (game) => {
                        const bishops = ['Bc4', 'Bb5', 'Bb3', 'Bc1', 'Bf1', 'Bc8', 'Bb7'];
                        const developedBishops = bishops.filter(move =>
                            game.history().includes(move)
                        );
                        return developedBishops.length < 1;
                    },
                    suggestion: 'Develop a bishop to an active square',
                    moves: ['Bc4', 'Bb5', 'Bc1', 'Bb7'],
                    icon: '♗',
                    priority: 0.7
                }
            ]
        },
        {
            category: 'Center Control',
            strategies: [
                {
                    name: 'Pawn Center',
                    condition: (game) => {
                        const centerMoves = ['e4', 'd4', 'e5', 'd5'];
                        const playedCenterMoves = centerMoves.filter(move =>
                            game.history().includes(move)
                        );
                        return playedCenterMoves.length < 2;
                    },
                    suggestion: 'Push a central pawn to control the center',
                    moves: ['e4', 'd4', 'e5', 'd5'],
                    icon: '⚔️',
                    priority: 0.9
                },
                {
                    name: 'Piece Pressure',
                    condition: (game) => {
                        const centerSquares = ['e4', 'd4', 'e5', 'd5'];
                        return !centerSquares.some(square =>
                            game.moves({ square }).length > 0
                        );
                    },
                    suggestion: 'Apply pressure on central squares',
                    moves: ['Nf3', 'Nc3', 'Bb5', 'Bc4'],
                    icon: '🎯',
                    priority: 0.6
                }
            ]
        },
        {
            category: 'King Safety',
            strategies: [
                {
                    name: 'Castling',
                    condition: (game) => {
                        return !game.history().some(move =>
                            move === 'O-O' || move === 'O-O-O'
                        );
                    },
                    suggestion: 'Consider castling to protect your king',
                    moves: ['O-O', 'O-O-O'],
                    icon: '🛡️',
                    priority: 0.7
                }
            ]
        }
    ];

    // Generate suggestions based on game state
    const suggestions = strategicInsights.flatMap(category =>
        category.strategies
            .filter(strategy => strategy.condition(game))
            .map(strategy => ({
                category: category.category,
                ...strategy
            }))
    );

    return suggestions.sort((a, b) => b.priority - a.priority);
};

function OpeningAnalysis() {
    const { state } = useChess();
    const [opening, setOpening] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [gameHistory, setGameHistory] = useState([]);

    // Memoized move extraction to prevent unnecessary re-renders
    const extractMoves = useMemo(() => {
        const contextGameHistory = state.gameHistory || [];
        const sanMoves = contextGameHistory.map(move => move.san);
        const gameHistoryMoves = state.game.history();
        return [...new Set([...sanMoves, ...gameHistoryMoves])];
    }, [state.gameHistory, state.game]);

    useEffect(() => {
        // Get the moves
        const moves = extractMoves;
        setGameHistory(moves);

        // Identify current opening
        const currentOpening = identifyOpening(moves);
        setOpening(currentOpening);

        // Generate strategic suggestions
        const strategicSuggestions = generateStrategicSuggestions(state.game);
        setSuggestions(strategicSuggestions);
    }, [extractMoves]);

    // If no game or game history is empty, return null
    if (!state.game || state.game.history().length === 0) {
        return (
            <div className="bg-[#2c2d32] rounded-2xl p-6 shadow-xl text-center text-gray-400">
                No game history available
            </div>
        );
    }

    return (
        <div className="bg-[#2c2d32] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6 text-blue-400" />
                    Opening Analysis
                </h3>
            </div>

            {opening ? (
                <div className="space-y-4">
                    {/* Opening Details */}
                    <div className="bg-[#25262b] rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-semibold text-lg">{opening.name}</h4>
                                <p className="text-gray-400 text-sm">{opening.eco}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Difficulty:</span>
                                <span className={`
                                    px-2 py-1 rounded-full text-xs font-semibold
                                    ${opening.difficulty === 'Advanced'
                                        ? 'bg-red-500/10 text-red-400'
                                        : opening.difficulty === 'Intermediate'
                                            ? 'bg-yellow-500/10 text-yellow-400'
                                            : 'bg-green-500/10 text-green-400'
                                    }
                                `}>
                                    {opening.difficulty}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-300 mt-2">{opening.description}</p>
                    </div>

                    {/* Opening Lines */}
                    <div className="bg-[#25262b] rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-400" />
                            Common Variations
                        </h4>
                        <div className="space-y-2">
                            {opening.lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded p-2 text-gray-300 text-sm"
                                >
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strategic Suggestions */}
                    {/* Strategic Suggestions */}
                    <div className="bg-[#25262b] rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center">
                            <LightBulbIcon className="h-5 w-5 mr-2 text-green-400" />
                            Strategic Suggestions
                        </h4>
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded-lg p-3 transition-all hover:bg-gray-700/50"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{suggestion.icon}</span>
                                            <div>
                                                <span className="text-white font-semibold block">
                                                    {suggestion.name}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {suggestion.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="h-2 w-16 bg-green-500/30 rounded-full"
                                            style={{
                                                width: `${suggestion.priority * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="text-gray-300 text-sm mt-2">
                                        <p className="mb-1">{suggestion.suggestion}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Possible moves:</span>
                                            {suggestion.moves.map((move, moveIndex) => (
                                                <span
                                                    key={moveIndex}
                                                    className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs"
                                                >
                                                    {move}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-400">
                    <p>No specific opening detected</p>
                    <p className="text-sm mt-2">Moves played: {gameHistory.join(', ')}</p>
                </div>
            )}
        </div>
    );
}

export default OpeningAnalysis;