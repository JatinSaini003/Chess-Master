// src/components/Analysis/AnalysisComponents/MistakeAnalysis.jsx
import React from 'react';
import {
    ExclamationTriangleIcon,
    BoltIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/solid';

export default function MistakeAnalysis({ analyses }) {
    // Calculate mistakes using the original MoveQualityChart logic
    const calculateMistakes = (moves) => {
        const stats = {
            blunder: 0,
            mistake: 0,
            inaccuracy: 0
        };

        moves.forEach(move => {
            // First, check for checkmate
            if (move.move?.includes('#')) return;

            const evalChange = move.evalChange;

            // If no evalChange, skip
            if (!evalChange && evalChange !== 0) return;

            // Original MoveQualityChart logic
            if (evalChange <= -1) {
                stats.blunder++;
            } else if (evalChange >= -1 && evalChange < -0.5) {
                stats.mistake++;
            } else if (evalChange >= -0.5 && evalChange < -0.1) {
                stats.inaccuracy++;
            }
        });

        return stats;
    };

    // Separate analyses for white and black
    const whiteAnalyses = analyses.filter(a => a.color === 'w');
    const blackAnalyses = analyses.filter(a => a.color === 'b');

    const whiteMistakes = calculateMistakes(whiteAnalyses);
    const blackMistakes = calculateMistakes(blackAnalyses);

    const mistakeCategories = [
        {
            type: 'Blunder',
            icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
            color: 'red-500',
            whiteCount: whiteMistakes.blunder,
            blackCount: blackMistakes.blunder
        },
        {
            type: 'Mistake',
            icon: <BoltIcon className="w-5 h-5 text-orange-500" />,
            color: 'orange-500',
            whiteCount: whiteMistakes.mistake,
            blackCount: blackMistakes.mistake
        },
        {
            type: 'Inaccuracy',
            icon: <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />,
            color: 'yellow-500',
            whiteCount: whiteMistakes.inaccuracy,
            blackCount: blackMistakes.inaccuracy
        }
    ];

    // Calculate total mistakes
    const totalMistakes = mistakeCategories.reduce((sum, category) =>
        sum + category.whiteCount + category.blackCount, 0);

    // Improved Mistake Severity Calculation
    const calculateMistakeSeverity = () => {
        // Use total number of mistakes for severity calculation
        const severityLevels = [
            { threshold: 3, label: 'Low', color: 'bg-green-500' },
            { threshold: 6, label: 'Medium', color: 'bg-yellow-500' },
            { threshold: 9, label: 'High', color: 'bg-orange-500' },
            { threshold: Infinity, label: 'Critical', color: 'bg-red-500' }
        ];

        const severity = severityLevels.find(level => totalMistakes <= level.threshold);

        return {
            level: severity.label,
            color: severity.color,
            totalMistakes: totalMistakes
        };
    };

    const mistakeSeverity = calculateMistakeSeverity();

    return (
        <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Critical Moments</h3>
                <div className="text-gray-400 text-sm">
                    Total Mistakes: {totalMistakes}
                </div>
            </div>

            <div className="space-y-4">
                {mistakeCategories.map(({
                    type,
                    icon,
                    color,
                    whiteCount,
                    blackCount
                }) => (
                    <div
                        key={type}
                        className="bg-[#2c2d32] rounded-xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {icon}
                                <span className="text-white font-medium">{type}s</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                        <span className={`text-white font-semibold`}>
                                            {whiteCount}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">White</span>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className={`text-white font-semibold`}>
                                            {blackCount}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400">Black</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Improved Mistake Severity Indicator */}
            <div className="mt-4 bg-[#2c2d32] rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-white text-sm">Mistake Severity</span>
                        <span className={`text-xs ${mistakeSeverity.color.replace('bg-', 'text-')}`}>
                            {mistakeSeverity.level} ({mistakeSeverity.totalMistakes} mistakes)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {['Low', 'Medium', 'High', 'Critical'].map((severity, index) => (
                            <div
                                key={severity}
                                className={`w-6 h-2 rounded-full ${severity === mistakeSeverity.level
                                        ? mistakeSeverity.color
                                        : 'bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}