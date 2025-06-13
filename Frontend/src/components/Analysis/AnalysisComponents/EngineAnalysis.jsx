// src/components/Analysis/AnalysisComponents/EngineAnalysis.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { stockfish } from '../../../services/stockfish.service';

function EngineAnalysis({ position, onAnalysis }) {
    const [analysis, setAnalysis] = useState(null);
    const [depth, setDepth] = useState(20);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [multiPV, setMultiPV] = useState(3); // Number of lines to analyze

    const analyzePosition = useCallback(async () => {
        if (!position || isAnalyzing) return;

        setIsAnalyzing(true);
        try {
            if (!stockfish.isReady) {
                await stockfish.init();
            }

            const result = await stockfish.analyze(position, depth);
            setAnalysis(result);
            if (onAnalysis) onAnalysis(result);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [position, depth, isAnalyzing, onAnalysis]);

    useEffect(() => {
        analyzePosition();
        return () => stockfish.stop();
    }, [analyzePosition]);

    const formatEvaluation = (score) => {
        if (score === null) return '0.0';
        if (score > 100) return `M${Math.ceil(score - 100)}`;
        if (score < -100) return `M${Math.floor(-score - 100)}`;
        return score.toFixed(1);
    };

    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Engine Analysis</h3>
                <div className="flex gap-2">
                    <select
                        value={depth}
                        onChange={(e) => setDepth(Number(e.target.value))}
                        className="bg-gray-600 text-white rounded px-2 py-1"
                    >
                        {[10, 15, 20, 25, 30].map(d => (
                            <option key={d} value={d}>Depth {d}</option>
                        ))}
                    </select>
                    <button
                        onClick={analyzePosition}
                        disabled={isAnalyzing}
                        className={`px-3 py-1 rounded ${isAnalyzing
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </div>

            {analysis && (
                <div className="space-y-4">
                    {/* Evaluation Bar */}
                    <div className="h-2 bg-gray-600 rounded overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{
                                width: `${50 + (analysis.score * 5)}%`,
                                maxWidth: '100%',
                                minWidth: '0%'
                            }}
                        />
                    </div>

                    {/* Evaluation Score */}
                    <div className="text-white text-center text-xl font-bold">
                        {formatEvaluation(analysis.score)}
                    </div>

                    {/* Best Lines */}
                    <div className="space-y-2">
                        {analysis.lines.map((line, index) => (
                            <div
                                key={index}
                                className="bg-gray-600 p-2 rounded text-white text-sm"
                            >
                                <span className="font-medium">Line {index + 1}: </span>
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Best Move Suggestion */}
                    <div className="bg-green-500 bg-opacity-20 p-2 rounded">
                        <p className="text-white">
                            Best move: <span className="font-bold">{analysis.bestMove}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EngineAnalysis;