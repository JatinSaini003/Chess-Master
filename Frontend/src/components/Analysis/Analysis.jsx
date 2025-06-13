// src/components/Analysis/Analysis.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useChess } from '../../context/chessContext';
import { useLocation } from 'react-router-dom';
import { Chess } from 'chess.js';
import Board from '../Board/Board';
import EvaluationBar from './EvaluationBar';
import GameStatistics from './AnalysisComponents/GameStatistics';
import MistakeAnalysis from './AnalysisComponents/MistakeAnalysis';
import MoveAccuracy from './AnalysisComponents/MoveAccuracy';
import MoveAnalyzer from './AnalysisComponents/MoveQualityAnalyzer';
import PGNTools from './AnalysisComponents/PGNTools';
import TimeAnalysis from './AnalysisComponents/TimeAnalysis';
import DetailedMoveAnalysis from './AnalysisComponents/DetailedMoveAnalysis';
import MoveQualityChart from './AnalysisComponents/MoveQualityChart';
import { EvaluationService } from '../../services/evaluation.service';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import OpeningAnalysis from './AnalysisComponents/OpeningAnalysis';
import EngineAnalysis from './EngineAnalysis';

function Analysis() {
    const location = useLocation();
    const { state } = useChess();
    const [analysis, setAnalysis] = useState(null);
    const [moveAnalyses, setMoveAnalyses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importedGame, setImportedGame] = useState(null);

    useEffect(() => {
        // Check for imported game from PGN import
        if (location.state?.importedGame) {
            setImportedGame(location.state.importedGame);
        }
    }, [location.state]);

    useEffect(() => {
        // Determine which game history to use
        const determineGameHistory = () => {
            if (importedGame) {
                // For imported game, create move objects
                return importedGame.moves.map((san, index) => {
                    const game = new Chess();
                    // Replay moves up to this point
                    importedGame.moves.slice(0, index).forEach(move => game.move(move));

                    // Move the game forward
                    const moveResult = game.move(san);

                    return {
                        san: san,
                        color: moveResult.color,
                        piece: moveResult.piece,
                        from: moveResult.from,
                        to: moveResult.to,
                        flags: moveResult.flags,
                        captured: moveResult.captured,
                        fen: game.fen(),
                        moveNumber: Math.floor(index / 2) + 1,
                    };
                });
            }

            // Use existing game history from state
            return state.gameHistory;
        };

        const gameHistory = determineGameHistory();

        if (gameHistory && gameHistory.length > 0) {
            analyzeMoves(gameHistory);
        }
    }, [importedGame, state.gameHistory]);

    const analyzeMoves = (gameHistory) => {
        setLoading(true);
        try {
            const analyses = gameHistory.map((move, index) => {
                const game = new Chess();
                // Replay all moves up to this point
                gameHistory.slice(0, index).forEach(m => game.move(m));

                const prevEval = EvaluationService.evaluatePosition(game).total;
                game.move(move);
                const newEval = EvaluationService.evaluatePosition(game).total;

                const evalChange = move.color === 'w' ? newEval - prevEval : prevEval - newEval;

                // Use actual move time from state
                const moveTime = index === 0
                    ? Math.min(state.moveTimes[index] || 0, 5) // Cap first move at 5 seconds
                    : state.moveTimes[index] || 0;

                let moveQuality;
                if (evalChange <= -1) moveQuality = 'Blunder';
                else if (evalChange >= -1 && evalChange < -0.5) moveQuality = 'Mistake';
                else if (evalChange >= -0.5 && evalChange < -0.1) moveQuality = 'Inaccuracy';
                else if (evalChange >= -0.1 && evalChange < 0.1) moveQuality = 'Book';
                else if (evalChange >= 0.1 && evalChange < 0.5) moveQuality = 'Good';
                else if (evalChange >= 0.5 && evalChange < 1) moveQuality = 'Excellent';
                else if (evalChange >= 1 && evalChange < 1.5) moveQuality = 'Best';
                else if (evalChange >= 1.5 && evalChange < 2) moveQuality = 'Great';
                else moveQuality = 'Brilliant';

                return {
                    moveNumber: Math.floor(index / 2) + 1,
                    color: move.color,
                    move: move.san,
                    piece: move.piece,
                    from: move.from,
                    to: move.to,
                    prevEval,
                    newEval,
                    evalChange,
                    quality: moveQuality,
                    position: move.fen,
                    isCheck: move.flags?.includes('+'),
                    isCheckmate: move.flags?.includes('#'),
                    isCastle: move.flags?.includes('k') || move.flags?.includes('q'),
                    isCapture: move.captured || move.flags?.includes('e'),
                    timeUsed: moveTime,
                    details: {
                        material: newEval - prevEval,
                        position: 0,
                        kingSafety: 0,
                        pawnStructure: 0,
                        mobility: game.moves().length / 20,
                        control: 0
                    }
                };
            });

            setMoveAnalyses(analyses);

            // Calculate overall statistics
            const stats = {
                totalMoves: gameHistory.length,
                blunders: analyses.filter(a => a.quality === 'Blunder').length,
                mistakes: analyses.filter(a => a.quality === 'Mistake').length,
                inaccuracies: analyses.filter(a => a.quality === 'Inaccuracy').length,
                averageEval: analyses.reduce((sum, a) => sum + a.newEval, 0) / analyses.length || 0,
                accuracy: calculateOverallAccuracy(analyses),
                totalTime: analyses.reduce((sum, a) => sum + a.timeUsed, 0),
                timePerMove: analyses.length > 0
                    ? analyses.reduce((sum, a) => sum + a.timeUsed, 0) / analyses.length
                    : 0
            };

            setAnalysis(stats);
        } catch (error) {
            console.error('Analysis error:', error);
        }
        setLoading(false);
    };

    const calculateOverallAccuracy = (analyses) => {
        if (!analyses.length) return 0;

        const accuracies = analyses.map(move => {
            const evalChange = move.evalChange;
            if (!evalChange && evalChange !== 0) return 0;
            if (evalChange >= 0) return 100;
            if (evalChange <= -5) return 0;
            return Math.max(0, 100 + (evalChange * 20));
        });

        return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    };

    function StatCard({ title, value, icon }) {
        const formatValue = () => {
            // Convert value to number if it's a string and contains a number
            const numericValue = typeof value === 'string' ? parseFloat(value) : value;

            if (title === "Time") {
                return typeof numericValue === 'number'
                    ? `${numericValue.toFixed(1)}s`
                    : '0.0s';
            }
            if (title === "Accuracy") {
                // Remove % if it exists in the string and convert to number
                const accuracyValue = typeof value === 'string'
                    ? parseFloat(value.replace('%', ''))
                    : numericValue;
                return typeof accuracyValue === 'number'
                    ? `${accuracyValue.toFixed(1)}%`
                    : '0.0%';
            }
            // For other numeric values (mistakes, blunders, etc.)
            return typeof numericValue === 'number' ? numericValue : 0;
        };


        return (
            <div className="bg-[#2c2d32] rounded-xl p-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-gray-400 text-sm">{title}</div>
                <div className="text-white text-xl font-bold mt-1">{formatValue()}</div>
            </div>
        );
    }

    // Also move LoadingCard outside
    function LoadingCard() {
        return (
            <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                    <span className="text-gray-400">Analyzing moves...</span>
                </div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-[#1a1b1e]">
                <div className="container mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Game Analysis</h1>
                        <div className="text-gray-400">
                            {importedGame
                                ? "Analyzing imported PGN game"
                                : "Analyzing your recent game"
                            }
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Board and Primary Analysis */}
                        <div className="lg:w-2/3 space-y-6">
                            {/* Board Section */}
                            <div className="bg-[#25262b] rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6">
                                    <div className="flex">
                                        <EvaluationBar position={importedGame
                                            ? new Chess(importedGame.startFen).fen()
                                            : state.game.fen()} />
                                        <div className="flex-1">
                                            <Board position={importedGame
                                                ? new Chess(importedGame.startFen).fen()
                                                : state.game.fen()} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Game Statistics Panel */}

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard
                                    title="Total Moves"
                                    value={moveAnalyses.length}
                                    icon="📊"
                                />
                                <StatCard
                                    title="Accuracy"
                                    value={`${analysis?.accuracy?.toFixed(1) || 0}%`}
                                    icon="🎯"
                                />
                                <StatCard
                                    title="Time"
                                    value={analysis?.timePerMove || 0}
                                    icon="⏱️"
                                />
                            </div>


                            {/* Additional Statistics */}
                            <div className="grid grid-cols-3 gap-4">
                                <StatCard
                                    title="Blunders"
                                    value={analysis?.blunders || 0}
                                    icon="❌"
                                />
                                <StatCard
                                    title="Mistakes"
                                    value={analysis?.mistakes || 0}
                                    icon="⚠️"
                                />
                                <StatCard
                                    title="Inaccuracies"
                                    value={analysis?.inaccuracies || 0}
                                    icon="⚡"
                                />
                            </div>

                            {/* Move Accuracy Chart */}
                            <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6">Accuracy Trend</h2>
                                <MoveAccuracy moves={moveAnalyses} />
                            </div>

                            {/* Time Analysis */}
                            <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-white mb-6">Time Usage</h2>
                                <TimeAnalysis moves={moveAnalyses} />
                            </div>

                            {/* Openings Analysis */}
                            <OpeningAnalysis />

                            <EngineAnalysis />
                        </div>

                        {/* Right Column - Detailed Analysis */}
                        <div className="lg:w-1/3 space-y-6">
                            {loading ? (
                                <LoadingCard />
                            ) : (
                                <>
                                    {/* Move Analysis chart */}
                                    <MoveQualityChart analyses={moveAnalyses} />

                                    {/* Move Analysis */}
                                    <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-white">Move Analysis</h2>
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                                                Latest Move
                                            </span>
                                        </div>
                                        <MoveAnalyzer analyses={moveAnalyses} />
                                    </div>

                                    {/* Mistakes Analysis */}
                                    <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                                        <h2 className="text-xl font-bold text-white mb-6">Critical Moments</h2>
                                        <MistakeAnalysis analyses={moveAnalyses} />
                                    </div>

                                    {/* PGN Tools */}
                                    <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                                        <h2 className="text-xl font-bold text-white mb-6">PGN Tools</h2>
                                        <PGNTools />
                                    </div>

                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}

export default Analysis;