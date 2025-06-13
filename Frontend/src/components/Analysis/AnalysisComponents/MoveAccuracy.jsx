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

    // Piece values
    const pieceValues = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };

    const evaluateCapture = (move, evalChange) => {
        if (!move.captured) return null;
        const capturingPieceValue = pieceValues[move.piece?.toLowerCase()] || 0;
        const capturedPieceValue = pieceValues[move.captured?.toLowerCase()] || 0;
        const valueDifference = capturedPieceValue - capturingPieceValue;

        if (move.move?.includes('#')) {
            return { accuracy: 100, quality: 'Brilliant' };
        }

        if (valueDifference > 0) {
            return {
                accuracy: 95 + Math.min(5, valueDifference),
                quality: evalChange >= 2 ? 'Brilliant' : 'Great'
            };
        } else if (valueDifference === 0) {
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
        if (move.move?.includes('#')) {
            return { accuracy: 100, quality: 'Brilliant' };
        }

        const evalChange = move.evalChange;
        if (evalChange === undefined) {
            return { accuracy: 0, quality: 'Mistake' };
        }

        const captureEvaluation = evaluateCapture(move, evalChange);
        if (captureEvaluation) return captureEvaluation;

        if (evalChange > 2) return { accuracy: 100, quality: 'Brilliant' };
        if (evalChange >= 1) return { accuracy: 90, quality: 'Great' };
        if (evalChange >= 0.5) return { accuracy: 85, quality: 'Good' };
        if (evalChange >= -0.1) return { accuracy: 75, quality: 'Book' };
        if (evalChange >= -0.5) return { accuracy: 65, quality: 'Inaccuracy' };
        if (evalChange >= -1) return { accuracy: 50, quality: 'Mistake' };
        return { accuracy: 30, quality: 'Blunder' };
    };

    const accuracyData = moves.map(move => {
        const isCheckmateMove = move.move?.includes('#');
        const analysis = isCheckmateMove
            ? { accuracy: 100, quality: 'Brilliant' }
            : calculateAccuracy(move);

        return {
            moveNumber: move.moveNumber,
            accuracy: analysis.accuracy,
            color: move.color,
            san: move.move,
            quality: analysis.quality,
            evalChange: move.evalChange,
            isCheckmate: isCheckmateMove,
            isCapture: !!move.captured,
            capturedPiece: move.captured,
            piece: move.piece
        };
    });

    const bestMove = accuracyData.reduce((best, current) =>
        current.accuracy > (best?.accuracy || 0) ? current : best, null);

    const worstMove = accuracyData.reduce((worst, current) =>
        current.accuracy < (worst?.accuracy || 100) ? current : worst, null);

    const data = {
        labels: accuracyData.map((d) => `${d.moveNumber}${d.color === 'b' ? 'b' : 'w'}`),
        datasets: [{
            label: 'Move Accuracy',
            data: accuracyData.map(d => d.accuracy),
            borderColor: (ctx) => accuracyData[ctx.dataIndex]?.color === 'w' ? 'rgba(255,255,255,0.8)' : 'rgba(59,130,246,0.8)',
            backgroundColor: (ctx) => accuracyData[ctx.dataIndex]?.color === 'w' ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.1)',
            pointBackgroundColor: (ctx) => {
                const move = accuracyData[ctx.dataIndex];
                if (!move) return '#fff';
                if (move.isCheckmate || move.san?.includes('#')) return '#22c55e';

                const qualityColors = {
                    Brilliant: '#22c55e',
                    Great: '#3b82f6',
                    Good: '#60a5fa',
                    Book: '#94a3b8',
                    Inaccuracy: '#eab308',
                    Mistake: '#f97316',
                    Blunder: '#ef4444',
                };
                return qualityColors[move.quality] || '#94a3b8';
            },
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                callbacks: {
                    title: (items) => {
                        const move = accuracyData[items[0]?.dataIndex];
                        if (!move) return '';
                        return `Move ${move.moveNumber} (${move.color === 'w' ? 'White' : 'Black'}): ${move.san}${move.isCheckmate ? ' (Checkmate!)' : ''}`;
                    },
                    label: (item) => {
                        const move = accuracyData[item.dataIndex];
                        if (!move) return [];
                        const labels = [
                            `Accuracy: ${move.accuracy.toFixed(1)}%`,
                            `Quality: ${move.quality}`
                        ];
                        if (move.isCheckmate) labels.push('Checkmate!');
                        else {
                            if (move.isCapture) labels.push(`Captured: ${move.capturedPiece?.toUpperCase()}`);
                            labels.push(`Eval Change: ${move.evalChange?.toFixed(2)}`);
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
                ticks: {
                    callback: (val) => `${val}%`,
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: { display: false }
            }
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <h3 className="text-lg font-semibold text-white mb-2 md:mb-0">Accuracy Trend</h3>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <span className="text-gray-400">White</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-400">Black</span>
                    </div>
                </div>
            </div>

            <div className="relative h-64 sm:h-72 md:h-80 mb-6">
                <Line data={data} options={options} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-1">Best Move</div>
                    <div className="text-xl font-bold text-green-400">{bestMove?.san || '-'}</div>
                    <div className="text-sm text-gray-400 mt-1">
                        Move {bestMove?.moveNumber} ({bestMove?.color === 'w' ? 'White' : 'Black'})
                    </div>
                    <div className="text-sm text-green-400/80 mt-1">
                        Accuracy: {bestMove?.accuracy?.toFixed(1)}%
                    </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-sm mb-1">Worst Move</div>
                    <div className="text-xl font-bold text-red-400">{worstMove?.san || '-'}</div>
                    <div className="text-sm text-gray-400 mt-1">
                        Move {worstMove?.moveNumber} ({worstMove?.color === 'w' ? 'White' : 'Black'})
                    </div>
                    <div className="text-sm text-red-400/80 mt-1">
                        Accuracy: {worstMove?.accuracy?.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
                {[
                    { color: '#22c55e', label: 'Brilliant' },
                    { color: '#3b82f6', label: 'Great' },
                    { color: '#60a5fa', label: 'Good' },
                    { color: '#94a3b8', label: 'Book' },
                    { color: '#eab308', label: 'Inaccuracy' },
                    { color: '#f97316', label: 'Mistake' },
                    { color: '#ef4444', label: 'Blunder' }
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="text-gray-400">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MoveAccuracy;