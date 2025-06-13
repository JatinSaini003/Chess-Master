// src/services/evaluation.service.js
export class EvaluationService {
    static evaluatePosition(game) {
        const evaluation = {
            material: this.evaluateMaterial(game),
            position: this.evaluatePositionalFactors(game),
            kingSafety: this.evaluateKingSafety(game),
            pawnStructure: this.evaluatePawnStructure(game),
            mobility: this.evaluateMobility(game),
            control: this.evaluateControl(game)
        };

        return {
            total: this.calculateTotal(evaluation),
            details: evaluation
        };
    }

    static evaluateMaterial(game) {
        const pieceValues = {
            p: 1, n: 3, b: 3.15, r: 5, q: 9, k: 0
        };

        let score = 0;
        const board = game.board();

        board.forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    const value = pieceValues[piece.type.toLowerCase()];
                    score += piece.color === 'w' ? value : -value;
                }
            });
        });

        return score;
    }

    static evaluatePositionalFactors(game) {
        let score = 0;
        const board = game.board();

        // Piece-square tables for positional evaluation
        const pawnTable = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5, 5, 10, 25, 25, 10, 5, 5],
            [0, 0, 0, 20, 20, 0, 0, 0],
            [5, -5, -10, 0, 0, -10, -5, 5],
            [5, 10, 10, -20, -20, 10, 10, 5],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        board.forEach((row, i) => {
            row.forEach((piece, j) => {
                if (piece) {
                    if (piece.type === 'p') {
                        const value = pawnTable[piece.color === 'w' ? i : 7 - i][j];
                        score += piece.color === 'w' ? value / 100 : -value / 100;
                    }
                    // Add more piece-square tables for other pieces
                }
            });
        });

        return score;
    }

    static evaluateKingSafety(game) {
        let score = 0;
        const whiteKing = this.findKing(game, 'w');
        const blackKing = this.findKing(game, 'b');

        // Evaluate pawn shield
        score += this.evaluatePawnShield(game, whiteKing, 'w');
        score -= this.evaluatePawnShield(game, blackKing, 'b');

        // Evaluate king exposure
        score += this.evaluateKingExposure(game, whiteKing, 'w');
        score -= this.evaluateKingExposure(game, blackKing, 'b');

        return score;
    }

    static evaluatePawnStructure(game) {
        let score = 0;

        // Evaluate doubled pawns
        score += this.evaluateDoubledPawns(game, 'w');
        score -= this.evaluateDoubledPawns(game, 'b');

        // Evaluate isolated pawns
        score += this.evaluateIsolatedPawns(game, 'w');
        score -= this.evaluateIsolatedPawns(game, 'b');

        // Evaluate passed pawns
        score += this.evaluatePassedPawns(game, 'w');
        score -= this.evaluatePassedPawns(game, 'b');

        return score;
    }

    // Helper methods
    static findKing(game, color) {
        const board = game.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { rank: i, file: j };
                }
            }
        }
        return null;
    }

    static evaluatePawnShield(game, kingPos, color) {
        if (!kingPos) return 0;
        let score = 0;
        const board = game.board();
        const rank = kingPos.rank;
        const file = kingPos.file;

        // Check pawns in front of the king
        const direction = color === 'w' ? -1 : 1;
        const pawnRanks = [rank + direction, rank + direction * 2];
        const pawnFiles = [file - 1, file, file + 1];

        pawnFiles.forEach(f => {
            if (f >= 0 && f < 8) {
                pawnRanks.forEach(r => {
                    if (r >= 0 && r < 8) {
                        const piece = board[r][f];
                        if (piece && piece.type === 'p' && piece.color === color) {
                            score += 0.2; // Bonus for each pawn shield
                        }
                    }
                });
            }
        });

        return score;
    }

    static evaluateKingExposure(game, kingPos, color) {
        if (!kingPos) return 0;
        let score = 0;
        const board = game.board();

        // Check squares around the king
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const rank = kingPos.rank + i;
                const file = kingPos.file + j;
                if (rank >= 0 && rank < 8 && file >= 0 && file < 8) {
                    const piece = board[rank][file];
                    if (!piece) {
                        score -= 0.1; // Penalty for exposed squares
                    }
                }
            }
        }

        return score;
    }

    static evaluateDoubledPawns(game, color) {
        let score = 0;
        const board = game.board();

        // Check each file for doubled pawns
        for (let file = 0; file < 8; file++) {
            let pawnCount = 0;
            for (let rank = 0; rank < 8; rank++) {
                const piece = board[rank][file];
                if (piece && piece.type === 'p' && piece.color === color) {
                    pawnCount++;
                }
            }
            if (pawnCount > 1) {
                score -= 0.3 * (pawnCount - 1); // Penalty for doubled pawns
            }
        }

        return score;
    }

    static evaluateIsolatedPawns(game, color) {
        let score = 0;
        const board = game.board();

        // Check each file for isolated pawns
        for (let file = 0; file < 8; file++) {
            let hasPawn = false;
            let hasNeighborPawn = false;

            // Check for pawns in current file
            for (let rank = 0; rank < 8; rank++) {
                const piece = board[rank][file];
                if (piece && piece.type === 'p' && piece.color === color) {
                    hasPawn = true;
                    break;
                }
            }

            // Check neighboring files
            if (hasPawn) {
                for (let neighborFile of [file - 1, file + 1]) {
                    if (neighborFile >= 0 && neighborFile < 8) {
                        for (let rank = 0; rank < 8; rank++) {
                            const piece = board[rank][neighborFile];
                            if (piece && piece.type === 'p' && piece.color === color) {
                                hasNeighborPawn = true;
                                break;
                            }
                        }
                    }
                }

                if (!hasNeighborPawn) {
                    score -= 0.3; // Penalty for isolated pawns
                }
            }
        }

        return score;
    }

    static evaluatePassedPawns(game, color) {
        let score = 0;
        const board = game.board();

        // Check each pawn for passed status
        for (let file = 0; file < 8; file++) {
            for (let rank = 0; rank < 8; rank++) {
                const piece = board[rank][file];
                if (piece && piece.type === 'p' && piece.color === color) {
                    const isPassed = this.isPassedPawn(game, rank, file, color);
                    if (isPassed) {
                        // Bonus increases as pawn advances
                        const advancement = color === 'w' ? (7 - rank) : rank;
                        score += 0.2 + (advancement * 0.1);
                    }
                }
            }
        }

        return score;
    }

    static isPassedPawn(game, rank, file, color) {
        const board = game.board();
        const direction = color === 'w' ? -1 : 1;
        const startRank = rank + direction;
        const endRank = color === 'w' ? 0 : 7;

        // Check if there are any opposing pawns ahead in same or adjacent files
        for (let r = startRank; color === 'w' ? r >= endRank : r <= endRank; r += direction) {
            for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
                const piece = board[r][f];
                if (piece && piece.type === 'p' && piece.color !== color) {
                    return false;
                }
            }
        }

        return true;
    }

    static evaluateMobility(game) {
        return game.moves().length * 0.1;
    }

    static evaluateControl(game) {
        let score = 0;
        const centralSquares = ['d4', 'd5', 'e4', 'e5'];

        centralSquares.forEach(square => {
            const piece = game.get(square);
            if (piece) {
                score += piece.color === 'w' ? 0.2 : -0.2;
            }
        });

        return score;
    }

    static calculateTotal(evaluation) {
        return (
            evaluation.material * 1.0 +
            evaluation.position * 0.2 +
            evaluation.kingSafety * 0.3 +
            evaluation.pawnStructure * 0.2 +
            evaluation.mobility * 0.15 +
            evaluation.control * 0.15
        )
    }
}