// src/components/Analysis/EngineAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { stockfishService } from '../../services/stockfish.service';
import { useChess } from '../../context/chessContext';

function EngineAnalysis() {
    const { state } = useChess();
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [depth, setDepth] = useState(20);

    useEffect(() => {
        const initEngine = async () => {
            try {
                await stockfishService.initialize();
            } catch (error) {
                console.error('Failed to initialize engine:', error);
            }
        };

        initEngine();
        return () => stockfishService.quit();
    }, []);

    useEffect(() => {
        if (state.game && !isAnalyzing) {
            analyzeCurrentPosition();
        }
    }, [state.game.fen()]);

    const analyzeCurrentPosition = async () => {
        setIsAnalyzing(true);
        try {
            const result = await stockfishService.analyzePosition(state.game.fen(), depth);
            setAnalysis(result);
        } catch (error) {
            console.error('Analysis error:', error);
        }
        setIsAnalyzing(false);
    };

    const formatEvaluation = (eval_) => {
        if (eval_ === null) return '0.0';
        if (eval_ === Infinity) return 'Mate';
        if (eval_ === -Infinity) return '-Mate';
        return eval_.toFixed(2);
    };

    const formatMoveSequence = (sequence) => {
        if (!sequence) return '';
        return sequence.slice(0, 5).join(' ');
    };

    if (!analysis) {
        return (
            <div className="bg-gray-800 rounded-lg p-4">
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-700 rounded"></div>
                            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Engine Analysis</h3>
                <div className="flex items-center gap-2">
                    <label className="text-gray-400 text-sm">Depth:</label>
                    <select
                        value={depth}
                        onChange={(e) => setDepth(Number(e.target.value))}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    >
                        {[10, 15, 20, 25, 30].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {/* Current Evaluation */}
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Current Evaluation:</span>
                        <span className={`font-mono font-bold ${analysis.evaluation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatEvaluation(analysis.evaluation)}
                        </span>
                    </div>
                </div>

                {/* Best Move */}
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Best Move:</span>
                        <span className="text-white font-mono">
                            {analysis.bestMove?.move}
                        </span>
                    </div>
                    {analysis.bestMove?.ponder && (
                        <div className="text-sm text-gray-500">
                            Expected reply: {analysis.bestMove.ponder}
                        </div>
                    )}
                </div>

                {/* Top Moves */}
                <div className="space-y-2">
                    <h4 className="text-gray-400 font-medium">Top Moves:</h4>
                    {analysis.topMoves.map((move, index) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-white font-mono">
                                    {move.sequence[0]}
                                </span>
                                <span className={`font-mono ${move.evaluation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatEvaluation(move.evaluation)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Line: {formatMoveSequence(move.sequence)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analysis Depth */}
                <div className="text-right text-sm text-gray-500">
                    Analysis depth: {analysis.depth}
                </div>
            </div>
        </div>
    );
}

export default EngineAnalysis;