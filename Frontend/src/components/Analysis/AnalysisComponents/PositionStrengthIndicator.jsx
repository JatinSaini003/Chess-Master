// src/components/Analysis/AnalysisComponents/PositionStrengthIndicator.jsx
import React from 'react';

function PositionStrengthIndicator({ evaluation, winChance }) {
    const getStrengthColor = (evaluation) => {
        if (evaluation > 3) return 'bg-green-500';
        if (evaluation > 1.5) return 'bg-green-400';
        if (evaluation > 0.5) return 'bg-blue-400';
        if (evaluation > -0.5) return 'bg-gray-400';
        if (evaluation > -1.5) return 'bg-orange-400';
        return 'bg-red-500';
    };

    const getWinChanceText = (chance) => {
        if (chance > 80) return 'Winning';
        if (chance > 60) return 'Very Favorable';
        if (chance > 40) return 'Slightly Better';
        if (chance > 20) return 'Equal';
        return 'Worse Position';
    };

    return (
        <div className="bg-gray-700 rounded-2xl p-4 sm:p-6 w-full shadow-lg">
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-4">Position Strength</h3>

            {/* Evaluation Bar */}
            <div className="relative h-4 bg-gray-600 rounded-full mb-4">
                <div
                    className={`absolute h-full rounded-full transition-all duration-300 ${getStrengthColor(evaluation)}`}
                    style={{
                        width: `${Math.min(Math.max((evaluation + 5) * 10, 0), 100)}%`
                    }}
                />
            </div>

            {/* Numerical Evaluation */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 mb-4">
                <span className="text-white text-sm sm:text-base">Evaluation:</span>
                <span className={`font-bold text-sm sm:text-base ${evaluation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {evaluation > 0 ? '+' : ''}{evaluation.toFixed(1)}
                </span>
            </div>

            {/* Win Chance */}
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 mb-2">
                    <span className="text-white text-sm sm:text-base">Win Chance:</span>
                    <span className="text-blue-400 font-bold text-sm sm:text-base">{winChance}%</span>
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                    {getWinChanceText(winChance)}
                </div>
            </div>

            {/* Position Features */}
            <div className="mt-4 space-y-3">
                <PositionFeature label="King Safety" value={calculateKingSafety()} />
                <PositionFeature label="Piece Activity" value={calculatePieceActivity()} />
                <PositionFeature label="Pawn Structure" value={calculatePawnStructure()} />
            </div>
        </div>
    );
}

function PositionFeature({ label, value }) {
    return (
        <div className="bg-gray-800 rounded-lg p-2">
            <div className="flex justify-between items-center">
                <span className="text-white text-xs sm:text-sm">{label}</span>
                <div className="w-24 h-2 bg-gray-600 rounded-full ml-2">
                    <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default PositionStrengthIndicator;