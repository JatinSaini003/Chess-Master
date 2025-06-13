// src/components/Analysis/AnalysisComponents/GameStatistics.jsx
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

function GameStatistics({ analyses = [], analysis = {} }) {
    const calculateStats = () => {
        const stats = {
            captures: { white: 0, black: 0 },
            checks: { white: 0, black: 0 },
            castling: { white: false, black: false },
            pieceMovements: {
                P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0
            }
        };

        analyses.forEach((move) => {
            const isWhite = move.color === 'w';

            if (move.captured) {
                isWhite ? stats.captures.white++ : stats.captures.black++;
            }

            if (move.san?.includes('+')) {
                isWhite ? stats.checks.white++ : stats.checks.black++;
            }

            if (move.san === 'O-O' || move.san === 'O-O-O') {
                isWhite ? stats.castling.white = true : stats.castling.black = true;
            }

            if (move.move?.piece) {
                stats.pieceMovements[move.move.piece.toUpperCase()]++;
            }
        });

        return stats;
    };

    const stats = calculateStats();

    return (
        <div className="bg-[#25262b] rounded-2xl p-4 md:p-6 shadow-xl w-full">
            <h3 className="text-white text-lg font-semibold mb-4">Game Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Captures Chart */}
                <div className="bg-[#2c2d32] p-4 rounded-xl">
                    <h4 className="text-white font-medium mb-2">Captures</h4>
                    <Doughnut
                        data={{
                            labels: ['White', 'Black'],
                            datasets: [{
                                data: [stats.captures.white, stats.captures.black],
                                backgroundColor: ['#f0f0f0', '#4a5568']
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: { color: 'white' }
                                }
                            }
                        }}
                    />
                </div>

                {/* Piece Movements Chart */}
                <div className="bg-[#2c2d32] p-4 rounded-xl">
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
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: 'white' }
                                },
                                x: {
                                    ticks: { color: 'white' }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Checks */}
                <div className="bg-[#2c2d32] p-4 rounded-xl flex flex-col gap-2">
                    <h4 className="text-white font-medium">Checks</h4>
                    <div className="flex justify-between text-gray-300">
                        <span>White: {stats.checks.white}</span>
                        <span>Black: {stats.checks.black}</span>
                    </div>
                </div>

                {/* Castling */}
                <div className="bg-[#2c2d32] p-4 rounded-xl flex flex-col gap-2">
                    <h4 className="text-white font-medium">Castling</h4>
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