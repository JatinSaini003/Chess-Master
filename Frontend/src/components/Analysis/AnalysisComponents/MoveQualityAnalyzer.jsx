// src/components/Analysis/AnalysisComponents/MoveQualityAnalyzer.jsx
export default function MoveQualityAnalyzer({ analyses }) {
    const latestMove = analyses[analyses.length - 1];

    const analyzeMoveQuality = (move) => {
        // Piece values for capture evaluation
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };


        // Determine if white won
        const isWhiteWin = move.isCheckmate && move.color === 'w';
        const isBlackWin = move.isCheckmate && move.color === 'b';

        const evalChange = move.evalChange;

        // Evaluate captures
        const evaluateCapture = () => {
            if (!move.captured) return null;
            const capturingPieceValue = pieceValues[move.piece?.toLowerCase()] || 0;
            const capturedPieceValue = pieceValues[move.captured?.toLowerCase()] || 0;
            return capturedPieceValue - capturingPieceValue;
        };

        // Calculate accuracy and quality - matching MoveAccuracy logic
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
                // Non-capture moves - match MoveAccuracy calculation
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
                        quality = 'Great';
                        description = 'Strong positional play';
                    } else if (accuracy >= 80) {
                        quality = 'Good';
                        description = 'Solid move';
                    } else if (accuracy >= 70) {
                        quality = 'Book';
                        description = 'Standard move';
                    } else if (accuracy >= 60) {
                        quality = 'Inaccuracy';
                        description = 'Slightly imprecise';
                    } else if (accuracy >= 40) {
                        quality = 'Mistake';
                        description = 'Missed better continuation';
                    } else {
                        quality = 'Blunder';
                        description = 'Serious mistake';
                    }
                }
            }
        }

        // Calculate factors for both sides
        const factors = {
            material: {
                white: -evalChange,
                black: evalChange,
                description: 'Material Balance'
            },
            position: {
                white: move.color === 'w' ? Math.abs(evalChange * 0.5) : -Math.abs(evalChange * 0.5),
                black: move.color === 'b' ? Math.abs(evalChange * 0.5) : -Math.abs(evalChange * 0.5),
                description: 'Position Strength'
            },
            kingSafety: {
                white: move.color === 'w' ? (move.isCheck ? -1 : 1) : (move.isCheck ? 1 : 0),
                black: move.color === 'b' ? (move.isCheck ? -1 : 1) : (move.isCheck ? 1 : 0),
                description: 'King Safety'
            },
            pawnStructure: {
                white: move.color === 'w' ? (move.piece === 'p' ? evalChange * 0.3 : 0) : -(move.piece === 'p' ? evalChange * 0.3 : 0),
                black: move.color === 'b' ? (move.piece === 'p' ? evalChange * 0.3 : 0) : -(move.piece === 'p' ? evalChange * 0.3 : 0),
                description: 'Pawn Structure'
            },
            mobility: {
                white: move.color === 'w' ? Math.abs(evalChange * 0.4) : -Math.abs(evalChange * 0.4),
                black: move.color === 'b' ? Math.abs(evalChange * 0.4) : -Math.abs(evalChange * 0.4),
                description: 'Piece Mobility'
            },
            control: {
                white: move.color === 'w' ? Math.abs(evalChange * 0.3) : -Math.abs(evalChange * 0.3),
                black: move.color === 'b' ? Math.abs(evalChange * 0.3) : -Math.abs(evalChange * 0.3),
                description: 'Board Control'
            }
        };

        // Calculate overall position
        const overallPosition = {
            white: Object.values(factors).reduce((sum, factor) => sum + factor.white, 0),
            black: Object.values(factors).reduce((sum, factor) => sum + factor.black, 0)
        };

        // Special case for checkmate
        if (move.isCheckmate || move.san?.includes('#')) {
            const checkmateValue = 5; // High positive value for checkmate
            if (move.color === 'w') {
                Object.keys(factors).forEach(key => {
                    factors[key].white = checkmateValue;
                    factors[key].black = -checkmateValue;
                });
                overallPosition.white = checkmateValue * Object.keys(factors).length;
                overallPosition.black = -checkmateValue * Object.keys(factors).length;
            } else {
                Object.keys(factors).forEach(key => {
                    factors[key].white = -checkmateValue;
                    factors[key].black = checkmateValue;
                });
                overallPosition.white = -checkmateValue * Object.keys(factors).length;
                overallPosition.black = checkmateValue * Object.keys(factors).length;
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
            {/* Move Quality Header */}
            <div className={`${getQualityColor(analysis.quality)} p-4 rounded-lg`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">{analysis.quality}</span>
                    <span className="text-sm font-medium">
                        Accuracy: {analysis.accuracy.toFixed(1)}%
                    </span>
                </div>
                <p className="text-sm text-gray-300">{analysis.description}</p>
            </div>

            {/* Position Analysis - Side by Side */}
            <div className="space-y-4">
                <h3 className="text-white text-sm font-semibold mb-4">Position Analysis</h3>
                <div className="grid grid-cols-2 gap-4">

                    {/* White's Side */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                            <h4 className="text-white font-semibold">White</h4>
                        </div>
                        {Object.entries(analysis.factors).map(([key, factor]) => (
                            <div key={`white-${key}`}
                                className="bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">
                                        {factor.description}
                                    </span>
                                    <span className={`font-mono text-sm ${analysis.isWhiteWin ? 'text-green-400' :
                                        analysis.isBlackWin ? 'text-red-400' :
                                            factor.white > 0 ? 'text-green-400' :
                                                factor.white < 0 ? 'text-red-400' :
                                                    'text-gray-400'
                                        }`}>
                                        {analysis.isWhiteWin || factor.white > 0 ? '+' : ''}
                                        {factor.white.toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${analysis.isWhiteWin ? 'bg-green-400' :
                                            analysis.isBlackWin ? 'bg-red-400' :
                                                factor.white > 0 ? 'bg-green-400' :
                                                    factor.white < 0 ? 'bg-red-400' :
                                                        'bg-gray-400'
                                            }`}
                                        style={{
                                            width: `${Math.min(100, Math.abs(factor.white * 20) + 50)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Black's Side */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <h4 className="text-white font-semibold">Black</h4>
                        </div>
                        {Object.entries(analysis.factors).map(([key, factor]) => (
                            <div key={`black-${key}`}
                                className="bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-400 text-sm">
                                        {factor.description}
                                    </span>
                                    <span className={`font-mono text-sm ${analysis.isBlackWin ? 'text-green-400' :
                                        analysis.isWhiteWin ? 'text-red-400' :
                                            factor.black > 0 ? 'text-green-400' :
                                                factor.black < 0 ? 'text-red-400' :
                                                    'text-gray-400'
                                        }`}>
                                        {analysis.isBlackWin || factor.black > 0 ? '+' : ''}
                                        {factor.black.toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${analysis.isBlackWin ? 'bg-green-400' :
                                            analysis.isWhiteWin ? 'bg-red-400' :
                                                factor.black > 0 ? 'bg-green-400' :
                                                    factor.black < 0 ? 'bg-red-400' :
                                                        'bg-gray-400'
                                            }`}
                                        style={{
                                            width: `${Math.min(100, Math.abs(factor.black * 20) + 50)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison Summary */}
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <span className="text-gray-400 text-sm">Overall Position</span>
                            <div className={`text-lg font-bold mt-1 ${analysis.isWhiteWin ? 'text-green-400' :
                                analysis.isBlackWin ? 'text-red-400' :
                                    analysis.overallPosition.white > 0 ? 'text-green-400' :
                                        analysis.overallPosition.white < 0 ? 'text-red-400' :
                                            'text-gray-400'
                                }`}>
                                {(analysis.isWhiteWin || analysis.overallPosition.white > 0) ? '+' : ''}
                                {analysis.overallPosition.white.toFixed(2)}
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-gray-400 text-sm">Overall Position</span>
                            <div className={`text-lg font-bold mt-1 ${analysis.isBlackWin ? 'text-green-400' :
                                analysis.isWhiteWin ? 'text-red-400' :
                                    analysis.overallPosition.black > 0 ? 'text-green-400' :
                                        analysis.overallPosition.black < 0 ? 'text-red-400' :
                                            'text-gray-400'
                                }`}>
                                {(analysis.isBlackWin || analysis.overallPosition.black > 0) ? '+' : ''}
                                {analysis.overallPosition.black.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}