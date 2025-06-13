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
    const strategicInsights = [/* same as before */];

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

    const extractMoves = useMemo(() => {
        const contextGameHistory = state.gameHistory || [];
        const sanMoves = contextGameHistory.map(move => move.san);
        const gameHistoryMoves = state.game.history();
        return [...new Set([...sanMoves, ...gameHistoryMoves])];
    }, [state.gameHistory, state.game]);

    useEffect(() => {
        const moves = extractMoves;
        setGameHistory(moves);
        setOpening(identifyOpening(moves));
        setSuggestions(generateStrategicSuggestions(state.game));
    }, [extractMoves]);

    if (!state.game || state.game.history().length === 0) {
        return (
            <div className="bg-[#2c2d32] rounded-2xl p-6 shadow-xl text-center text-gray-400 text-sm sm:text-base">
                No game history available
            </div>
        );
    }

    return (
        <div className="bg-[#2c2d32] rounded-2xl p-4 sm:p-6 shadow-xl w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
                    <BookOpenIcon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-400" />
                    Opening Analysis
                </h3>
            </div>

            {opening ? (
                <div className="space-y-4">
                    {/* Opening Details */}
                    <div className="bg-[#25262b] rounded-xl p-4 space-y-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-6">
                            <div>
                                <h4 className="text-white font-semibold text-base sm:text-lg">{opening.name}</h4>
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
                        <p className="text-gray-300 text-sm">{opening.description}</p>
                    </div>

                    {/* Opening Lines */}
                    <div className="bg-[#25262b] rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center text-base">
                            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-400" />
                            Common Variations
                        </h4>
                        <div className="space-y-2">
                            {opening.lines.map((line, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded p-2 text-gray-300 text-xs sm:text-sm overflow-x-auto"
                                >
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strategic Suggestions */}
                    <div className="bg-[#25262b] rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3 flex items-center text-base">
                            <LightBulbIcon className="h-5 w-5 mr-2 text-green-400" />
                            Strategic Suggestions
                        </h4>
                        <div className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-800 rounded-lg p-3 transition-all hover:bg-gray-700/50"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{suggestion.icon}</span>
                                            <div>
                                                <span className="text-white font-semibold block text-sm sm:text-base">
                                                    {suggestion.name}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    {suggestion.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="h-2 w-full sm:w-20 bg-green-500/30 rounded-full"
                                            style={{
                                                width: `${suggestion.priority * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="text-gray-300 text-sm mt-2">
                                        <p className="mb-1">{suggestion.suggestion}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-gray-500 text-xs">Moves:</span>
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
                <div className="text-center text-gray-400 text-sm sm:text-base">
                    <p>No specific opening detected</p>
                    <p className="text-xs sm:text-sm mt-2">Moves played: {gameHistory.join(', ')}</p>
                </div>
            )}
        </div>
    );
}

export default OpeningAnalysis;