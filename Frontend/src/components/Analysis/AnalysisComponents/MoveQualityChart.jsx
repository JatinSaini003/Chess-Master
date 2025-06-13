// src/components/Analysis/AnalysisComponents/MoveQualityChart.jsx
import React from 'react';
import { identifyOpening } from '../../../Data/openings';

function MoveQualityChart({ analyses }) {
    const allMoves = analyses.map(move => move.move);
    const whiteAnalyses = analyses.filter(move => move.color === 'w');
    const blackAnalyses = analyses.filter(move => move.color === 'b');

    const getStats = (moves) => {
        const stats = {
            brilliant: 0,
            great: 0,
            good: 0,
            book: 0,
            inaccuracy: 0,
            mistake: 0,
            blunder: 0
        };

        moves.forEach((move, moveIndex) => {
            if (moveIndex < 10) {
                const openingSequence = allMoves.slice(0, moveIndex + 1);
                const opening = identifyOpening(openingSequence);
                const openingMoves = opening?.moves || opening?.sequence || [];

                if (opening && openingMoves.length === openingSequence.length) {
                    stats.book++;
                    return;
                }
            }

            if (move.move?.includes('#')) {
                stats.brilliant++;
                return;
            }

            const evalChange = move.evalChange;
            if (!evalChange && evalChange !== 0) return;

            if (evalChange > 5 && !move.captured && !move.forced) {
                stats.brilliant++;
            } else if (evalChange > 1.5) {
                stats.great++;
            } else if (evalChange > 0.8) {
                stats.good++;
            } else if (evalChange > -0.5) {
                // Neutral
            } else if (evalChange > -1.5) {
                stats.inaccuracy++;
            } else if (evalChange > -3.0) {
                stats.mistake++;
            } else {
                stats.blunder++;
            }
        });

        const accuracy = moves.reduce((sum, move) => {
            if (move.move?.includes('#')) return sum + 100;
            const evalChange = move.evalChange;
            if (!evalChange && evalChange !== 0) return sum;

            if (move.captured) {
                const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
                const capturing = pieceValues[move.piece?.toLowerCase()] || 0;
                const captured = pieceValues[move.captured?.toLowerCase()] || 0;
                const diff = captured - capturing;

                if (diff > 0) return sum + (95 + Math.min(5, diff));
                if (diff === 0) return sum + (evalChange >= 0 ? 85 : 70);
            }

            if (evalChange > 5 && !move.captured && !move.forced) return sum + 100;
            if (evalChange > 1.5) return sum + 90;
            if (evalChange > 0.8) return sum + 80;
            if (evalChange > -0.5) return sum + 70;
            if (evalChange > -1.5) return sum + 50;
            if (evalChange > -3.0) return sum + 30;
            if (evalChange > -5.0) return sum + 20;
            return sum + 0;
        }, 0) / (moves.length || 1);

        return { ...stats, accuracy };
    };

    const whiteStats = getStats(whiteAnalyses);
    const blackStats = getStats(blackAnalyses);

    const moveCategories = [
        { name: 'Brilliant', color: 'text-cyan-400', icon: '!!', bgColor: 'bg-cyan-400/10' },
        { name: 'Great', color: 'text-blue-400', icon: '!', bgColor: 'bg-blue-400/10' },
        { name: 'Good', color: 'text-green-200', icon: '✓', bgColor: 'bg-green-200/10' },
        { name: 'Book', color: 'text-gray-400', icon: '📖', bgColor: 'bg-gray-400/10' },
        { name: 'Inaccuracy', color: 'text-yellow-400', icon: '?!', bgColor: 'bg-yellow-400/10' },
        { name: 'Mistake', color: 'text-orange-400', icon: '?', bgColor: 'bg-orange-400/10' },
        { name: 'Blunder', color: 'text-red-500', icon: '??', bgColor: 'bg-red-500/10' }
    ];

    return (
        <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl w-full">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Move Quality Analysis</h2>

            {/* Accuracy Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-6">
                <div className="text-center">
                    <div className="text-gray-400 text-sm">White</div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                        {whiteStats.accuracy.toFixed(1)}
                    </div>
                </div>
                <div className="text-gray-400 text-base sm:text-lg font-semibold">Accuracy</div>
                <div className="text-center">
                    <div className="text-gray-400 text-sm">Black</div>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                        {blackStats.accuracy.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Move Categories */}
            <div className="space-y-2">
                {moveCategories.map((category) => (
                    <div
                        key={category.name}
                        className="grid grid-cols-3 items-center py-2 border-b border-gray-700/50 text-sm sm:text-base"
                    >
                        <div className="text-center text-white">
                            {whiteStats[category.name.toLowerCase()]}
                        </div>
                        <div className={`flex items-center justify-center gap-2 ${category.bgColor} py-1 rounded`}>
                            <span className={`${category.color} text-base sm:text-xl`}>{category.icon}</span>
                            <span className="text-gray-300 text-sm sm:text-base">{category.name}</span>
                        </div>
                        <div className="text-center text-white">
                            {blackStats[category.name.toLowerCase()]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MoveQualityChart;
