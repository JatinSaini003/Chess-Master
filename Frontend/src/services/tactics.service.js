// src/services/tactics.service.js
import { Chess } from 'chess.js';

export class TacticsService {
    static isFork(position) {
        const game = new Chess(position);
        const moves = game.moves({ verbose: true });

        // Check if any piece attacks multiple pieces
        for (const move of moves) {
            const tempGame = new Chess(position);
            tempGame.move(move);

            const attacks = this.getAttacks(tempGame, move.to);
            if (attacks.length > 1) {
                const attackedPieceValues = attacks.map(square => {
                    const piece = tempGame.get(square);
                    return this.getPieceValue(piece.type);
                });

                // Consider it a fork if attacking pieces of significant value
                if (attackedPieceValues.filter(v => v >= 3).length > 1) {
                    return true;
                }
            }
        }
        return false;
    }

    static isPin(position) {
        const game = new Chess(position);
        const turn = game.turn();
        const kingSquare = this.findKing(game, turn);

        // Check for pieces that could potentially be pinned
        const pieces = this.getPieces(game, turn);

        for (const piece of pieces) {
            // Check if removing the piece exposes the king to attack
            const tempGame = new Chess(position);
            const originalPiece = tempGame.remove(piece.square);
            if (this.isSquareAttacked(tempGame, kingSquare)) {
                tempGame.put(originalPiece, piece.square);
                return true;
            }
        }
        return false;
    }

    static isSkewer(position) {
        // Similar to pin but attacking two pieces in a line
        const game = new Chess(position);
        const moves = game.moves({ verbose: true });

        for (const move of moves) {
            const tempGame = new Chess(position);
            tempGame.move(move);

            const ray = this.getRayAttacks(tempGame, move.to);
            if (ray.length >= 2) {
                const pieceValues = ray.map(square => {
                    const piece = tempGame.get(square);
                    return this.getPieceValue(piece.type);
                });

                if (pieceValues[0] > pieceValues[1]) {
                    return true;
                }
            }
        }
        return false;
    }

    // Helper methods
    static getPieceValue(type) {
        const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        return values[type.toLowerCase()];
    }

    static getAttacks(game, square) {
        const attacks = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const targetSquare = String.fromCharCode(97 + j) + (8 - i);
                const piece = game.get(targetSquare);
                if (piece && this.isValidAttack(game, square, targetSquare)) {
                    attacks.push(targetSquare);
                }
            }
        }
        return attacks;
    }

    // ... Add more helper methods as needed
}