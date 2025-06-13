// File: src/components/Analysis/Analysis.jsx

import React, { useState, useEffect } from 'react';
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
        if (location.state?.importedGame) {
            setImportedGame(location.state.importedGame);
        }
    }, [location.state]);

    useEffect(() => {
        const determineGameHistory = () => {
            if (importedGame) {
                return importedGame.moves.map((san, index) => {
                    const game = new Chess();
                    importedGame.moves.slice(0, index).forEach(move => game.move(move));
                    const moveResult = game.move(san);
                    return {
                        san,
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
                gameHistory.slice(0, index).forEach(m => game.move(m));
                const prevEval = EvaluationService.evaluatePosition(game).total;
                game.move(move);
                const newEval = EvaluationService.evaluatePosition(game).total;

                const evalChange = move.color === 'w' ? newEval - prevEval : prevEval - newEval;
                const moveTime = index === 0 ? Math.min(state.moveTimes[index] || 0, 5) : state.moveTimes[index] || 0;

                let moveQuality;
                if (evalChange <= -1) moveQuality = 'Blunder';
                else if (evalChange < -0.5) moveQuality = 'Mistake';
                else if (evalChange < -0.1) moveQuality = 'Inaccuracy';
                else if (evalChange < 0.1) moveQuality = 'Book';
                else if (evalChange < 0.5) moveQuality = 'Good';
                else if (evalChange < 1) moveQuality = 'Excellent';
                else if (evalChange < 1.5) moveQuality = 'Best';
                else if (evalChange < 2) moveQuality = 'Great';
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
                        mobility: game.moves().length / 20,
                    }
                };
            });

            setMoveAnalyses(analyses);

            const stats = {
                totalMoves: gameHistory.length,
                blunders: analyses.filter(a => a.quality === 'Blunder').length,
                mistakes: analyses.filter(a => a.quality === 'Mistake').length,
                inaccuracies: analyses.filter(a => a.quality === 'Inaccuracy').length,
                averageEval: analyses.reduce((sum, a) => sum + a.newEval, 0) / analyses.length || 0,
                accuracy: calculateOverallAccuracy(analyses),
                totalTime: analyses.reduce((sum, a) => sum + a.timeUsed, 0),
                timePerMove: analyses.length > 0 ? analyses.reduce((sum, a) => sum + a.timeUsed, 0) / analyses.length : 0,
            };

            setAnalysis(stats);
        } catch (err) {
            console.error('Error in analysis:', err);
        }
        setLoading(false);
    };

    const calculateOverallAccuracy = (analyses) => {
        if (!analyses.length) return 0;
        const accuracies = analyses.map(({ evalChange }) => {
            if (!evalChange && evalChange !== 0) return 0;
            if (evalChange >= 0) return 100;
            if (evalChange <= -5) return 0;
            return Math.max(0, 100 + evalChange * 20);
        });
        return accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    };

    function StatCard({ title, value, icon }) {
        const formatValue = () => {
            const num = typeof value === 'string' ? parseFloat(value) : value;
            if (title === "Time") return `${num?.toFixed(1) || 0}s`;
            if (title === "Accuracy") return `${parseFloat(num)?.toFixed(1) || 0}%`;
            return typeof num === 'number' ? num : 0;
        };
        return (
            <div className="bg-[#2c2d32] rounded-xl p-4 flex flex-col justify-between items-start shadow-md">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-gray-400 text-sm">{title}</div>
                <div className="text-white text-xl font-bold mt-1">{formatValue()}</div>
            </div>
        );
    }

    const LoadingCard = () => (
        <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                <span className="text-gray-400">Analyzing moves...</span>
            </div>
        </div>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-[#1a1b1e]">
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Game Analysis</h1>
                        <div className="text-gray-400 text-sm sm:text-base">
                            {importedGame ? "Analyzing imported PGN game" : "Analyzing your recent game"}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column */}
                        <div className="lg:w-2/3 space-y-6">
                            <div className="bg-[#25262b] rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-4 sm:p-6 flex flex-row gap-4 items-stretch justify-center">

                                    {/* Evaluation Bar with full height of board */}
                                    <div className="flex-shrink-0 w-4 sm:w-5 md:w-6">
                                        <div className="h-full relative" style={{ height: '100%' }}>
                                            <EvaluationBar
                                                position={importedGame ? new Chess(importedGame.startFen).fen() : state.game.fen()}
                                            />
                                        </div>
                                    </div>

                                    {/* Chess Board - responsive and square */}
                                    <div className="relative aspect-square w-full max-w-[90vw] sm:max-w-[500px]">
                                        <Board
                                            position={importedGame ? new Chess(importedGame.startFen).fen() : state.game.fen()}
                                        />
                                    </div>
                                </div>
                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard title="Total Moves" value={moveAnalyses.length} icon="📊" />
                                <StatCard title="Accuracy" value={`${analysis?.accuracy?.toFixed(1) || 0}%`} icon="🎯" />
                                <StatCard title="Time" value={analysis?.timePerMove || 0} icon="⏱️" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard title="Blunders" value={analysis?.blunders || 0} icon="❌" />
                                <StatCard title="Mistakes" value={analysis?.mistakes || 0} icon="⚠️" />
                                <StatCard title="Inaccuracies" value={analysis?.inaccuracies || 0} icon="⚡" />
                            </div>

                            <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Accuracy Trend</h2>
                                <MoveAccuracy moves={moveAnalyses} />
                            </div>

                            <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Time Usage</h2>
                                <TimeAnalysis moves={moveAnalyses} />
                            </div>

                            <OpeningAnalysis />
                            <EngineAnalysis />
                        </div>

                        {/* Right Column */}
                        <div className="lg:w-1/3 space-y-6">
                            {loading ? (
                                <LoadingCard />
                            ) : (
                                <>
                                    <MoveQualityChart analyses={moveAnalyses} />
                                    <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg sm:text-xl font-bold text-white">Move Analysis</h2>
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                                                Latest Move
                                            </span>
                                        </div>
                                        <MoveAnalyzer analyses={moveAnalyses} />
                                    </div>

                                    <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl">
                                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Critical Moments</h2>
                                        <MistakeAnalysis analyses={moveAnalyses} />
                                    </div>

                                    <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl">
                                        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">PGN Tools</h2>
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