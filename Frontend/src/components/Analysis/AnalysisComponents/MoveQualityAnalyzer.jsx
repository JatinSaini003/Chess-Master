// src/components/Analysis/AnalysisComponents/MoveQualityAnalyzer.jsx

export default function MoveQualityAnalyzer({ analyses }) {
    const latestMove = analyses[analyses.length - 1];
    const analyzeMoveQuality = (move) => {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        const isWhiteWin = move.isCheckmate && move.color === 'w';
        const isBlackWin = move.isCheckmate && move.color === 'b';
        const evalChange = move.evalChange;

        const evaluateCapture = () => {
            if (!move.captured) return null;
            const capturingPieceValue = pieceValues[move.piece?.toLowerCase()] || 0;
            const capturedPieceValue = pieceValues[move.captured?.toLowerCase()] || 0;
            return capturedPieceValue - capturingPieceValue;
        };

        let accuracy, quality, description;
        if (move.isCheckmate || move.san?.includes('#')) {
            accuracy = 100;
            quality = 'Brilliant';
            description = 'Checkmate!';
        } else {
            const captureValue = evaluateCapture();
            if (captureValue !== null) {
                if (captureValue > 0) {
                    accuracy = 95 + Math.min(5, captureValue);
                    quality = evalChange >= 2 ? 'Brilliant' : 'Great';
                    description = `Winning ${Math.abs(captureValue)} points of material`;
                } else if (captureValue === 0) {
                    accuracy = 90;
                    quality = evalChange >= 0 ? 'Good' : 'Inaccuracy';
                    description = 'Even material exchange';
                } else {
                    accuracy = Math.max(0, 80 + captureValue * 10);
                    quality = 'Mistake';
                    description = `Losing ${Math.abs(captureValue)} points of material`;
                }
            } else {
                if (evalChange >= 0) {
                    accuracy = 100;
                    quality = evalChange >= 2 ? 'Brilliant' : 'Great';
                    description = evalChange >= 2 ? 'Exceptional move!' : 'Very strong move';
                } else if (evalChange <= -5) {
                    accuracy = 0;
                    quality = 'Blunder';
                    description = 'Critical mistake';
                } else {
                    accuracy = Math.max(0, 100 + (evalChange * 20));
                    if (accuracy >= 90) {
                        quality = 'Great'; description = 'Strong positional play';
                    } else if (accuracy >= 80) {
                        quality = 'Good'; description = 'Solid move';
                    } else if (accuracy >= 70) {
                        quality = 'Book'; description = 'Standard move';
                    } else if (accuracy >= 60) {
                        quality = 'Inaccuracy'; description = 'Slightly imprecise';
                    } else if (accuracy >= 40) {
                        quality = 'Mistake'; description = 'Missed better continuation';
                    } else {
                        quality = 'Blunder'; description = 'Serious mistake';
                    }
                }
            }
        }

        const factorCalc = (modifier, cond) => move.color === cond ? modifier : -modifier;
        const factors = {
            material: {
                white: -evalChange, black: evalChange, description: 'Material Balance'
            },
            position: {
                white: factorCalc(Math.abs(evalChange * 0.5), 'w'),
                black: factorCalc(Math.abs(evalChange * 0.5), 'b'),
                description: 'Position Strength'
            },
            kingSafety: {
                white: move.color === 'w' ? (move.isCheck ? -1 : 1) : (move.isCheck ? 1 : 0),
                black: move.color === 'b' ? (move.isCheck ? -1 : 1) : (move.isCheck ? 1 : 0),
                description: 'King Safety'
            },
            pawnStructure: {
                white: factorCalc(move.piece === 'p' ? evalChange * 0.3 : 0, 'w'),
                black: factorCalc(move.piece === 'p' ? evalChange * 0.3 : 0, 'b'),
                description: 'Pawn Structure'
            },
            mobility: {
                white: factorCalc(Math.abs(evalChange * 0.4), 'w'),
                black: factorCalc(Math.abs(evalChange * 0.4), 'b'),
                description: 'Piece Mobility'
            },
            control: {
                white: factorCalc(Math.abs(evalChange * 0.3), 'w'),
                black: factorCalc(Math.abs(evalChange * 0.3), 'b'),
                description: 'Board Control'
            }
        };

        const overallPosition = {
            white: Object.values(factors).reduce((sum, factor) => sum + factor.white, 0),
            black: Object.values(factors).reduce((sum, factor) => sum + factor.black, 0)
        };

        if (move.isCheckmate || move.san?.includes('#')) {
            const val = 5;
            const updateSide = (side, mult) => {
                Object.keys(factors).forEach(key => {
                    factors[key][side] = val * mult;
                });
                overallPosition[side] = val * Object.keys(factors).length * mult;
            };
            if (move.color === 'w') {
                updateSide('white', 1); updateSide('black', -1);
            } else {
                updateSide('white', -1); updateSide('black', 1);
            }
        }

        return { quality, accuracy, factors, overallPosition, description, isWhiteWin, isBlackWin };
    };

    if (!latestMove) return null;
    const analysis = analyzeMoveQuality(latestMove);

    const getQualityColor = (quality) => {
        const colors = {
            'Brilliant': 'text-green-400 bg-green-400/10',
            'Great': 'text-blue-400 bg-blue-400/10',
            'Good': 'text-blue-300 bg-blue-300/10',
            'Book': 'text-gray-400 bg-gray-400/10',
            'Inaccuracy': 'text-yellow-400 bg-yellow-400/10',
            'Mistake': 'text-orange-400 bg-orange-400/10',
            'Blunder': 'text-red-400 bg-red-400/10'
        };
        return colors[quality] || 'text-gray-400 bg-gray-400/10';
    };

    return (
        <div className="space-y-6 p-4 bg-gray-800/30 rounded-xl">
            {/* Header */}
            <div className={`${getQualityColor(analysis.quality)} p-4 rounded-lg`}>
                <div className="flex flex-col sm:flex-row items-center justify-between mb-2">
                    <span className="text-lg font-bold">{analysis.quality}</span>
                    <span className="text-sm font-medium">Accuracy: {analysis.accuracy.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-300">{analysis.description}</p>
            </div>

            {/* Position Analysis */}
            <div className="space-y-4">
                <h3 className="text-white text-sm font-semibold mb-2">Position Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* White and Black Side reused here – unchanged layout logic */}
                    {['white', 'black'].map((side, i) => (
                        <div key={side} className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${side === 'white' ? 'bg-white' : 'bg-blue-500'}`}></div>
                                <h4 className="text-white font-semibold">{side[0].toUpperCase() + side.slice(1)}</h4>
                            </div>
                            {Object.entries(analysis.factors).map(([key, factor]) => {
                                const value = factor[side];
                                const isWin = (side === 'white' && analysis.isWhiteWin) || (side === 'black' && analysis.isBlackWin);
                                return (
                                    <div key={`${side}-${key}`} className="bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/50 transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-400 text-sm">{factor.description}</span>
                                            <span className={`font-mono text-sm ${isWin ? 'text-green-400' :
                                                value > 0 ? 'text-green-400' :
                                                    value < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                {isWin || value > 0 ? '+' : ''}{value.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${isWin ? 'bg-green-400' :
                                                value > 0 ? 'bg-green-400' :
                                                    value < 0 ? 'bg-red-400' : 'bg-gray-400'}`}
                                                style={{ width: `${Math.min(100, Math.abs(value * 20) + 50)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-center">
                        {['white', 'black'].map((side) => (
                            <div key={side}>
                                <span className="text-gray-400 text-sm">Overall Position</span>
                                <div className={`text-lg font-bold mt-1 ${analysis[`is${side[0].toUpperCase() + side.slice(1)}Win`] ? 'text-green-400' :
                                    analysis.overallPosition[side] > 0 ? 'text-green-400' :
                                        analysis.overallPosition[side] < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {(analysis.overallPosition[side] > 0 ? '+' : '') + analysis.overallPosition[side].toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}