// src/components/Analysis/AnalysisComponents/MoveAccuracy.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function MoveAccuracy({ moves }) {
    if (!moves || moves.length === 0) {
        return (
            <div className="text-gray-400 text-center py-4">
                No moves to analyze
            </div>
        );
    }

    const evaluateCapture = (move, evalChange) => {
        // Piece values
        const pieceValues = {
            'p': 1,  // pawn
            'n': 3,  // knight
            'b': 3,  // bishop
            'r': 5,  // rook
            'q': 9,  // queen
            'k': 0   // king (not typically captured)
        };

        // If it's not a capture, return null to use standard evaluation
        if (!move.captured) return null;

        const capturingPieceValue = pieceValues[move.piece?.toLowerCase()] || 0;
        const capturedPieceValue = pieceValues[move.captured?.toLowerCase()] || 0;
        const valueDifference = capturedPieceValue - capturingPieceValue;

        // Check for checkmate in capturing moves
        if (move.move?.includes('#')) {
            return {
                accuracy: 100,
                quality: 'Brilliant'
            };
        }

        // Evaluate the capture quality
        if (valueDifference > 0) {
            // Winning material
            return {
                accuracy: 95 + Math.min(5, valueDifference),
                quality: evalChange >= 2 ? 'Brilliant' : 'Great'
            };
        } else if (valueDifference === 0) {
            // Even trade
            return {
                accuracy: evalChange >= 0 ? 85 : 70,
                quality: evalChange >= 0 ? 'Good' : 'Inaccuracy'
            };
        } else {
            return {
                accuracy: Math.max(50, 70 + valueDifference * 10),
                quality: evalChange >= -0.5 ? 'Inaccuracy' : 'Mistake'
            };
        }
    };

    const calculateAccuracy = (move) => {
        // First check for checkmate
        if (move.move?.includes('#')) {
            return {
                accuracy: 100,
                quality: 'Brilliant'
            };
        }

        const evalChange = move.evalChange;
        if (!evalChange && evalChange !== 0) {
            return {
                accuracy: 0,
                quality: 'Mistake'
            };
        }

        // Check for captures first
        const captureEvaluation = evaluateCapture(move, evalChange);
        if (captureEvaluation) {
            return captureEvaluation;
        }

        // Calculate accuracy based on centipawn loss
        if (evalChange > 2) {
            return {
                accuracy: 100,
                quality: 'Brilliant'
            };
        } else if (evalChange >= 1) {
            return {
                accuracy: 90,
                quality: 'Great'
            };
        } else if (evalChange >= 0.5) {
            return {
                accuracy: 85,
                quality: 'Good'
            };
        } else if (evalChange >= -0.1) {
            return {
                accuracy: 75,
                quality: 'Book'
            };
        } else if (evalChange >= -0.5) {
            return {
                accuracy: 65,
                quality: 'Inaccuracy'
            };
        } else if (evalChange >= -1) {
            return {
                accuracy: 50,
                quality: 'Mistake'
            };
        } else {
            return {
                accuracy: 30,
                quality: 'Blunder'
            };
        }
    };

    const accuracyData = moves.map(move => {
        const isCheckmateMove = move.move?.includes('#');

        // Force analysis for checkmate moves
        const analysis = isCheckmateMove ?
            {
                accuracy: 100,
                quality: 'Brilliant',
            } :
            calculateAccuracy(move);

        return {
            moveNumber: move.moveNumber,
            accuracy: analysis.accuracy,
            color: move.color,
            san: move.move,
            quality: analysis.quality,
            evalChange: move.evalChange,
            isCheckmate: isCheckmateMove,
            isCapture: move.captured ? true : false,
            capturedPiece: move.captured,
            piece: move.piece
        };
    });

    const bestMove = accuracyData.reduce((best, current) =>
        current.accuracy > (best?.accuracy || 0) ? current : best
        , null);

    const worstMove = accuracyData.reduce((worst, current) =>
        current.accuracy < (worst?.accuracy || 100) ? current : worst
        , null);

    const data = {
        labels: accuracyData.map((d, i) => `${d.moveNumber}${d.color === 'b' ? 'b' : 'w'}`),
        datasets: [{
            label: 'Move Accuracy',
            data: accuracyData.map(d => d.accuracy),
            borderColor: (context) => {
                const index = context.dataIndex;
                const move = accuracyData[index];
                return move?.color === 'w'
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(59, 130, 246, 0.8)';
            },
            backgroundColor: (context) => {
                const index = context.dataIndex;
                const move = accuracyData[index];
                return move?.color === 'w'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(59, 130, 246, 0.1)';
            },
            pointBackgroundColor: (context) => {
                const index = context.dataIndex;
                const move = accuracyData[index];
                if (!move) return 'rgba(255, 255, 255, 0.8)';

                // First check for checkmate as it should always be Brilliant (green)
                if (move.isCheckmate || move.san?.includes('#')) {
                    return '#22c55e'; // green-500 for Brilliant moves
                }

                switch (move.quality) {
                    case 'Brilliant': return '#22c55e'; // green-500
                    case 'Great': return '#3b82f6';    // blue-500
                    case 'Good': return '#60a5fa';     // blue-400
                    case 'Book': return '#94a3b8';     // gray-400
                    case 'Inaccuracy': return '#eab308'; // yellow-500
                    case 'Mistake': return '#f97316';   // orange-500
                    case 'Blunder': return '#ef4444';   // red-500
                    default: return '#94a3b8';
                }
            },
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 8,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                padding: 12,
                displayColors: true,
                callbacks: {
                    title: (tooltipItems) => {
                        if (!tooltipItems || !tooltipItems[0]) return '';
                        const move = accuracyData[tooltipItems[0].dataIndex];
                        if (!move) return '';
                        const checkmateText = move.isCheckmate ? ' (Checkmate!)' : '';
                        return `Move ${move.moveNumber} ${move.color === 'w' ? '(White)' : '(Black)'}: ${move.san}${checkmateText}`;
                    },
                    label: (tooltipItem) => {
                        if (!tooltipItem || typeof tooltipItem.dataIndex === 'undefined') return [];
                        const move = accuracyData[tooltipItem.dataIndex];
                        if (!move) return [];

                        const labels = [
                            `Accuracy: ${move.isCheckmate ? '100.0' : move.accuracy.toFixed(1)}%`,
                            `Quality: ${move.isCheckmate ? 'Brilliant' : move.quality}`
                        ];

                        if (move.isCheckmate) {
                            labels.push('Checkmate!');
                        } else if (move.isCapture) {
                            labels.push(`Captured: ${move.capturedPiece.toUpperCase()}`);
                            labels.push(`Eval Change: ${move.evalChange.toFixed(2)}`);
                        } else {
                            labels.push(`Eval Change: ${move.evalChange.toFixed(2)}`);
                        }

                        return labels;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    callback: (value) => `${value}%`
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700/50" >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Accuracy Trend</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <span className="text-sm text-gray-400">White</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-400">Black</span>
                    </div>
                </div>
            </div>

            <div className="relative h-64 mb-6">
                <Line data={data} options={options} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Best Move</div>
                    <div className="text-xl font-bold text-green-400">
                        {bestMove?.san || '-'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        Move {bestMove?.moveNumber} ({bestMove?.color === 'w' ? 'White' : 'Black'})
                    </div>
                    <div className="text-sm text-green-400/80 mt-1">
                        Accuracy: {bestMove?.accuracy.toFixed(1)}%
                    </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Worst Move</div>
                    <div className="text-xl font-bold text-red-400">
                        {worstMove?.san || '-'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        Move {worstMove?.moveNumber} ({worstMove?.color === 'w' ? 'White' : 'Black'})
                    </div>
                    <div className="text-sm text-red-400/80 mt-1">
                        Accuracy: {worstMove?.accuracy.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="mt-7 grid grid-cols-3 md:grid-cols-7 gap-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                    <span className="text-gray-400">Brilliant</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-gray-400">Great</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
                    <span className="text-gray-400">Good</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#94a3b8]"></div>
                    <span className="text-gray-400">Book</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                    <span className="text-gray-400">Inaccuracy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                    <span className="text-gray-400">Mistake</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-gray-400">Blunder</span>
                </div>
            </div>
        </div >
    );
}

export default MoveAccuracy;