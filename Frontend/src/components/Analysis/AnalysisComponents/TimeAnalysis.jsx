// src/components/Analysis/AnalysisComponents/TimeAnalysis.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';

function TimeAnalysis({ moves = [] }) {
    const validMoves = moves.map((move, index) => ({
        ...move,
        timeUsed: index === 0 ? Math.min(move.timeUsed, 5) : move.timeUsed
    }));

    const whiteData = moves.filter(move => move.color === 'w');
    const blackData = moves.filter(move => move.color === 'b');

    const stats = {
        whiteAvg: whiteData.length > 0
            ? whiteData.reduce((sum, move) => sum + move.timeUsed, 0) / whiteData.length
            : 0,
        blackAvg: blackData.length > 0
            ? blackData.reduce((sum, move) => sum + move.timeUsed, 0) / blackData.length
            : 0,
        longestMove: Math.max(...moves.map(move => move.timeUsed))
    };

    return (
        <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="text-white text-lg font-semibold">Time per Move</h3>
                <div className="text-sm text-gray-400">
                    Total Moves: {moves.length}
                </div>
            </div>

            <div className="h-64 w-full">
                <Line
                    data={{
                        labels: Array.from({ length: Math.max(...moves.map(m => m.moveNumber)) }, (_, i) => `Move ${i + 1}`),
                        datasets: [
                            {
                                label: 'White',
                                data: whiteData.map(d => ({
                                    x: d.moveNumber,
                                    y: d.timeUsed
                                })),
                                borderColor: 'rgba(255, 255, 255, 0.8)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                                pointBorderColor: 'rgba(255, 255, 255, 1)',
                                pointRadius: 4,
                                tension: 0.4,
                                fill: true
                            },
                            {
                                label: 'Black',
                                data: blackData.map(d => ({
                                    x: d.moveNumber,
                                    y: d.timeUsed
                                })),
                                borderColor: 'rgba(59, 130, 246, 0.8)',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                pointBorderColor: 'rgba(59, 130, 246, 1)',
                                pointRadius: 4,
                                tension: 0.4,
                                fill: true
                            }
                        ]
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Seconds',
                                    color: 'white'
                                },
                                ticks: {
                                    color: 'white',
                                    callback: (value) => `${value.toFixed(1)}s`
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Move Number',
                                    color: 'white'
                                },
                                ticks: {
                                    color: 'white'
                                },
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: 'white'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `Time: ${context.raw.y.toFixed(1)}s`
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h4 className="text-gray-400 text-sm">White Avg/Move</h4>
                    <p className="text-white text-lg font-semibold">
                        {stats.whiteAvg.toFixed(1)}s
                    </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h4 className="text-gray-400 text-sm">Black Avg/Move</h4>
                    <p className="text-white text-lg font-semibold">
                        {stats.blackAvg.toFixed(1)}s
                    </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h4 className="text-gray-400 text-sm">Longest Move</h4>
                    <p className="text-white text-lg font-semibold">
                        {stats.longestMove.toFixed(1)}s
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TimeAnalysis;