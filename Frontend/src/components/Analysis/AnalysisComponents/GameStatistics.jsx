// src/components/Analysis/AnalysisComponents/GameStatistics.jsx
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

function GameStatistics({ analyses = [], analysis = {} }) {
    // Calculate statistics
    const calculateStats = () => {
        const stats = {
            captures: { white: 0, black: 0 },
            checks: { white: 0, black: 0 },
            castling: { white: false, black: false },
            pieceMovements: {
                P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0
            },
            squareControl: { white: 0, black: 0 },
            centerControl: { white: 0, black: 0 }
        };

        analyses.forEach((move) => {
            const isWhite = move.color === 'w';

            // Count captures
            if (move.captured) {
                if (isWhite) stats.captures.white++;
                else stats.captures.black++;
            }

            // Count checks
            if (move.san.includes('+')) {
                if (isWhite) stats.checks.white++;
                else stats.checks.black++;
            }

            // Track castling
            if (move.san === 'O-O' || move.san === 'O-O-O') {
                if (isWhite) stats.castling.white = true;
                else stats.castling.black = true;
            }

            // Count piece movements
            if (move.move && move.move.piece) {
                stats.pieceMovements[move.move.piece.toUpperCase()]++;
            }
        });

        return stats;
    };

    const stats = calculateStats();

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Game Statistics</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Captures Chart */}
                <div>
                    <h4 className="text-white font-medium mb-2">Captures</h4>
                    <Doughnut
                        data={{
                            labels: ['White', 'Black'],
                            datasets: [{
                                data: [
                                    stats.captures.white,
                                    stats.captures.black
                                ],
                                backgroundColor: ['#f0f0f0', '#4a5568']
                            }]
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    labels: {
                                        color: 'white'
                                    }
                                }
                            }
                        }}
                    />
                </div>

                {/* Piece Movement Chart */}
                <div>
                    <h4 className="text-white font-medium mb-2">Piece Movements</h4>
                    <Bar
                        data={{
                            labels: ['Pawns', 'Knights', 'Bishops', 'Rooks', 'Queens', 'Kings'],
                            datasets: [{
                                data: Object.values(stats.pieceMovements),
                                backgroundColor: 'rgb(59, 130, 246)'
                            }]
                        }}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: 'white'
                                    }
                                },
                                x: {
                                    ticks: {
                                        color: 'white'
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Additional Statistics */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-3">
                    <h4 className="text-white font-medium mb-2">Checks</h4>
                    <div className="flex justify-between text-gray-300">
                        <span>White: {stats.checks.white}</span>
                        <span>Black: {stats.checks.black}</span>
                    </div>
                </div>

                <div className="bg-gray-800 rounded p-3">
                    <h4 className="text-white font-medium mb-2">Castling</h4>
                    <div className="flex justify-between text-gray-300">
                        <span>White: {stats.castling.white ? 'Yes' : 'No'}</span>
                        <span>Black: {stats.castling.black ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameStatistics;