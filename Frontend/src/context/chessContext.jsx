import React, { createContext, useReducer, useContext } from 'react';
import { Chess } from 'chess.js';
import api from '../services/api.service';

const ChessContext = createContext();

const initialState = {
    game: new Chess(),
    history: [],
    gameHistory: [],
    currentMove: 0,
    lastMove: null,
    capturedPieces: { w: [], b: [] },
    timeLeft: { w: 600, b: 600 },
    isTimerRunning: false,
    loading: false,
    error: null,
    piecePosition: new Map(),
    movingPiece: null,
    analysis: null,
    moveEvaluations: [],
    mistakes: [],
    engineAnalysis: null,
    moveStartTime: Date.now(),
    moveTimes: [], // Array to store time taken for each move
};

async function makeMove(game, move) {
    try {
        const response = await api.post(`/games/${game.id}/move`, { move });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to make move');
    }
}

async function analyzePosition(gameId, fen) {
    try {
        const response = await api.post(`/analysis/${gameId}/analyze`, { fen });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to analyze position');
    }
}

function chessReducer(state, action) {
    switch (action.type) {
        case 'MAKE_MOVE':
            try {
                const newGame = new Chess(state.game.fen());
                const move = newGame.move(action.move);
                const currentTime = Date.now();
                const moveTimeInSeconds = state.isTimerRunning
                    ? (currentTime - state.moveStartTime) / 1000
                    : 0;

                if (move) {
                    const moveNotation = move.san;
                    const newCapturedPieces = {
                        w: [...state.capturedPieces.w],
                        b: [...state.capturedPieces.b]
                    }
                    if (move.captured) {
                        const capturedPiece = move.color === 'w' ? move.captured.toLowerCase() : move.captured.toUpperCase();
                        newCapturedPieces[move.color] = [...newCapturedPieces[move.color], capturedPiece]
                    }
                    const moveDetails = {
                        ...move,
                        fen: newGame.fen(),
                        moveNumber: Math.floor(state.gameHistory.length / 2) + 1,
                    };

                    return {
                        ...state,
                        game: newGame,
                        history: [...state.history, moveNotation],
                        currentMove: state.currentMove + 1,
                        lastMove: { from: move.from, to: move.to },
                        capturedPieces: newCapturedPieces,
                        isTimerRunning: true,
                        gameHistory: [...state.gameHistory, moveDetails],
                        moveTimes: [...state.moveTimes, moveTimeInSeconds],
                        moveStartTime: currentTime, // Reset start time for next move
                    };
                }
                return state;
            } catch (error) {
                console.error('Invalid move:', error);
                return state;
            }

        case 'UPDATE_TIMER':
            const { color } = action;
            const newTimeLeft = { ...state.timeLeft };
            newTimeLeft[color] = Math.max(0, state.timeLeft[color] - 1);

            return {
                ...state,
                timeLeft: newTimeLeft
            };

        case 'STOP_TIMER':
            return {
                ...state,
                isTimerRunning: false
            };

        case 'NEW_GAME':
            return {
                ...initialState,
                game: new Chess(),
                capturedPieces: { w: [], b: [] },
                timeLeft: { w: 600, b: 600 },
                isTimerRunning: false
            }

        case 'SET_ANALYSIS':
            return {
                ...state,
                analysis: action.payload,
            };

        case 'SET_ENGINE_ANALYSIS':
            return {
                ...state,
                engineAnalysis: action.payload,
            };

        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };

        case 'UNDO_MOVE':
            const newGame = new Chess(state.game.fen());
            newGame.undo();
            return {
                ...state,
                game: newGame,
                history: state.history.slice(0, -1),
                currentMove: state.currentMove - 1,
                lastMove: null
            };

        case 'GO_TO_MOVE':
            const targetGame = new Chess();
            const moves = state.game.history();
            moves.slice(0, action.payload).forEach(move => targetGame.move(move));
            return {
                ...state,
                game: targetGame,
                currentMove: action.payload,
            };

        case 'GO_TO_START':
            return {
                ...state,
                game: new Chess(),
                currentMove: 0,
            };

        case 'GO_TO_END':
            return {
                ...state,
                currentMove: state.game.history().length,
            };

        case 'PREV_MOVE':
            if (state.currentMove > 0) {
                const prevGame = new Chess();
                const moves = state.game.history();
                moves.slice(0, state.currentMove - 1).forEach(move => prevGame.move(move));
                return {
                    ...state,
                    game: prevGame,
                    currentMove: state.currentMove - 1,
                };
            }
            return state;

        case 'NEXT_MOVE':
            if (state.currentMove < state.game.history().length) {
                const nextGame = new Chess();
                const moves = state.game.history();
                moves.slice(0, state.currentMove + 1).forEach(move => nextGame.move(move));
                return {
                    ...state,
                    game: nextGame,
                    currentMove: state.currentMove + 1,
                };
            }
            return state;

        default:
            return state;
    }
}

export function ChessProvider({ children }) {
    const [state, dispatch] = useReducer(chessReducer, initialState);

    const value = {
        state,
        dispatch,
        makeMove: async (move) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const updatedGame = await makeMove(state.game, move);
                dispatch({ type: 'MAKE_MOVE', payload: updatedGame });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error.message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        analyzePosition: async (fen) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const analysis = await analyzePosition(state.game.id, fen);
                dispatch({ type: 'SET_ANALYSIS', payload: analysis });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error.message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
        analyzeWithEngine: async (fen) => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const analysis = await stockfishService.analyzePosition(fen);
                dispatch({ type: 'SET_ENGINE_ANALYSIS', payload: analysis });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error.message });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        },
    };

    return (
        <ChessContext.Provider value={value}>
            {children}
        </ChessContext.Provider>
    );
}

export function useChess() {
    return useContext(ChessContext);
}