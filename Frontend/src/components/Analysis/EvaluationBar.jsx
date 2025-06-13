import React from 'react';
import { Chess } from 'chess.js';
import { EvaluationService } from '../../services/evaluation.service';

function EvaluationBar({ position }) {
    const calculateEvaluation = () => {
        if (!position) return 0;
        try {
            const game = new Chess(position);
            const evaluation = EvaluationService.evaluatePosition(game);
            return evaluation.total;
        } catch (error) {
            console.error('Evaluation error:', error);
            return 0;
        }
    };

    const evaluation = calculateEvaluation();

    const getWhiteBarHeight = () => {
        const baseHeight = 50;
        const maxChange = 50;
        const evalChange = Math.min(Math.abs(evaluation), 5) * (maxChange / 5);

        if (evaluation >= 0) {
            return baseHeight + evalChange;
        } else {
            return baseHeight;
        }
    };

    const getBlackBarHeight = () => {
        const baseHeight = 50;
        const maxChange = 50;
        const evalChange = Math.min(Math.abs(evaluation), 5) * (maxChange / 5);

        if (evaluation <= 0) {
            return baseHeight + evalChange;
        } else {
            return baseHeight;
        }
    };

    const formatEvaluation = (evaluation) => {
        if (Math.abs(evaluation) >= 100) return "M" + Math.floor(Math.abs(evaluation) / 100);
        return evaluation.toFixed(1);
    };

    return (
        <div className="relative w-6 sm:w-6 h-full min-h-[180px] bg-gray-800 mr-2 rounded">
            {/* Evaluation number */}
            <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs sm:text-xs text-white z-10 bg-gray-800 px-1 py-0.5 rounded whitespace-nowrap"
                style={{ minWidth: '30px', textAlign: 'center' }}
            >
                {formatEvaluation(evaluation)}
            </div>

            <div className="absolute inset-0 flex flex-col">
                {/* Black's bar (top) */}
                <div
                    className="w-full bg-black transition-all duration-300"
                    style={{
                        height: `${evaluation <= 0 ? getBlackBarHeight() : 50}%`
                    }}
                />

                {/* White's bar (bottom) */}
                <div
                    className="w-full bg-white transition-all duration-300"
                    style={{
                        height: `${evaluation >= 0 ? getWhiteBarHeight() : 50}%`
                    }}
                />
            </div>

            {/* Center line */}
            <div className="absolute top-1/2 w-full h-[1px] bg-gray-600" />

            {/* Scale marks */}
            <div className="absolute inset-y-0 right-0 w-[2px]">
                {[-3, -2, -1, 0, 1, 2, 3].map((value) => (
                    <div
                        key={value}
                        className="absolute w-full h-[1px] bg-gray-600"
                        style={{
                            top: `${50 - (value * 16.67)}%`,
                            opacity: value === 0 ? 1 : 0.5
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default EvaluationBar;