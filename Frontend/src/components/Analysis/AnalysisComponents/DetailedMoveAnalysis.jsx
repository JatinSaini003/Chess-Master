// src/components/Analysis/AnalysisComponents/DetailedMoveAnalysis.jsx
import React from 'react';
import { MoveQualityService } from '../../../services/moveQuality.service';

function DetailedMoveAnalysis({ moves, currentPosition }) {
    return (
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 w-full shadow-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Detailed Move Analysis</h3>
            <div className="space-y-4">
                {moves.map((move, index) => (
                    <MoveDetail
                        key={index}
                        move={move}
                        moveNumber={Math.floor(index / 2) + 1}
                        isSelected={currentPosition === index}
                    />
                ))}
            </div>
        </div>
    );
}

function MoveDetail({ move, moveNumber, isSelected }) {
    const quality = MoveQualityService.analyzeMove(
        move.prevEval,
        move.newEval,
        move.position
    );

    const getQualityColor = (type) => {
        const colors = {
            brilliant: 'text-purple-400',
            best: 'text-green-400',
            good: 'text-blue-400',
            book: 'text-gray-400',
            inaccuracy: 'text-yellow-400',
            mistake: 'text-orange-400',
            blunder: 'text-red-400'
        };
        return colors[type] || 'text-white';
    };

    return (
        <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-900' : 'bg-gray-700'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-gray-400">{moveNumber}.</span>
                    <span className="text-white font-medium">{move.san}</span>
                    <span className={`${getQualityColor(quality.classification.type)} font-semibold`}>
                        {quality.classification.symbol}
                    </span>
                </div>
                <div className="text-gray-300 text-sm sm:text-base">
                    Accuracy: {quality.accuracy.toFixed(1)}%
                </div>
            </div>

            {move.bestLine && (
                <div className="mt-2 text-sm text-gray-400 break-words">
                    Best line: <span className="text-gray-200">{move.bestLine}</span>
                </div>
            )}
        </div>
    );
}

export default DetailedMoveAnalysis;