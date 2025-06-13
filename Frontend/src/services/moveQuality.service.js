// src/services/moveQuality.service.js
import { identifyOpening } from '../Data/openings';

export class MoveQualityService {
    static analyzeMove(previousEval, currentEval, position) {
        const evalChange = currentEval - previousEval;
        return {
            classification: this.classifyMove(evalChange, position),
            accuracy: this.calculateAccuracy(evalChange),
            evalChange
        };
    }

    static classifyMove(evalChange, position) {
        // First check if it's a known book move
        const isBookMove = this.isKnownBookMove(position);

        if (isBookMove) {
            return { type: 'book', symbol: '=' };
        }

        // Then evaluate based on evaluation change
        if (evalChange > 2) return { type: 'brilliant', symbol: '!!' };
        if (evalChange > 0.5) return { type: 'best', symbol: '!' };
        if (evalChange > 0) return { type: 'good', symbol: '⋮' };
        if (evalChange > -0.3) return { type: 'inaccuracy', symbol: '?!' };
        if (evalChange > -1) return { type: 'mistake', symbol: '?' };
        return { type: 'blunder', symbol: '??' };
    }

    static isKnownBookMove(position) {
        const { moves } = position;
        if (!moves || moves.length === 0) return false;

        // Get the current move sequence
        const moveSequence = moves.map(move => move.san);

        // Check against opening database
        const opening = identifyOpening(moveSequence);

        // Consider it a book move if we're still in known opening lines
        return opening !== null;
    }

    static calculateAccuracy(evalChange) {
        if (evalChange >= 0) return 100;
        if (evalChange <= -5) return 0;
        return Math.max(0, 100 + (evalChange * 20));
    }
}