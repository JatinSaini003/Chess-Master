import React, { useState, useEffect, useCallback } from 'react';
import Board from '../Board/Board';
import { Chess } from 'chess.js';
import { useChess } from '../../context/chessContext';
import GameOverModal from './GameOverModal';
import wP from '../../assets/pieces/wP.svg';
import wR from '../../assets/pieces/wR.svg';
import wN from '../../assets/pieces/wN.svg';
import wB from '../../assets/pieces/wB.svg';
import wQ from '../../assets/pieces/wQ.svg';
import wK from '../../assets/pieces/wK.svg';
import bP from '../../assets/pieces/bP.svg';
import bR from '../../assets/pieces/bR.svg';
import bN from '../../assets/pieces/bN.svg';
import bB from '../../assets/pieces/bB.svg';
import bQ from '../../assets/pieces/bQ.svg';
import bK from '../../assets/pieces/bK.svg';

import { playSound } from '../../Utils/sounds';
import GameControls from './GameControls';
import MoveNotation from './MoveNotation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EvaluationBar from '../Analysis/EvaluationBar';
import { useNavigate } from 'react-router-dom';

const pieceImages = {
    'P': wP,
    'R': wR,
    'N': wN,
    'B': wB,
    'Q': wQ,
    'K': wK,
    'p': bP,
    'r': bR,
    'n': bN,
    'b': bB,
    'q': bQ,
    'k': bK,
};

function ClassicGame() {
    const { state, dispatch } = useChess();
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDraw, setIsDraw] = useState(false);
    const [whiteWarningPlayed, setWhiteWarningPlayed] = useState(false);
    const [blackWarningPlayed, setBlackWarningPlayed] = useState(false);
    const [gameResult, setGameResult] = useState("");
    const [evaluation, setEvaluation] = useState(0);
    const navigate = useNavigate();


    const handleResign = () => {
        const winner = state.game.turn() === 'w' ? 'Black' : 'White';
        setGameResult(`${winner} wins by resignation!`);
        setIsDraw(false);
        setIsModalOpen(true);
        dispatch({ type: 'STOP_TIMER' });
        playSound.gameEnd();
    };

    const handleDrawOffer = () => {
        setGameResult(`${state.game.turn() === 'w' ? 'White' : 'Black'} offers a draw`);
        setIsDraw(true);
        setIsModalOpen(true);
    };

    const handleAcceptDraw = () => {
        setGameResult("Game ended in a draw by agreement");
        setIsDraw(false);
        dispatch({ type: 'STOP_TIMER' });
        playSound.gameEnd();
    };

    const handleDeclineDraw = () => {
        setIsModalOpen(false);
        setIsDraw(false);
    };

    // Valid Moves
    const getValidMoves = (square) => {
        const moves = state.game.moves({ square, verbose: true });
        return moves.map(move => move.to);
    };

    // Timer logic
    useEffect(() => {
        const checkLowTime = () => {
            const currentColor = state.game.turn();
            const timeLeft = state.timeLeft[currentColor];

            // Check for time out
            if (timeLeft <= 0) {
                dispatch({ type: 'STOP_TIMER' });
                const winner = currentColor === 'w' ? 'Black' : 'White';
                playSound.gameEnd();
                setIsModalOpen(true);
                setGameResult(`${winner} wins: ${winner === 'White' ? 'Black' : 'White'} ran out of time!`);
                return true; // Return true if time is out
            }

            if (timeLeft <= 60 && timeLeft > 0 && state.isTimerRunning) {
                if (currentColor === 'w' && !whiteWarningPlayed) {
                    playSound.timeRunning();
                    setWhiteWarningPlayed(true);
                } else if (currentColor === 'b' && !blackWarningPlayed) {
                    playSound.timeRunning();
                    setBlackWarningPlayed(true);
                }
            }
            return false
        }

        let interval;
        if (state.isTimerRunning) {
            interval = setInterval(() => {
                const isTimeOut = checkLowTime()
                if (!isTimeOut) {
                    dispatch({
                        type: 'UPDATE_TIMER',
                        color: state.game.turn()
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.isTimerRunning, state.game.turn(), state.timeLeft]);

    const isPlayerTurn = (color) => state.game.turn() === color;

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const renderCapturedPieces = (color) => {
        const pieces = state.capturedPieces[color === 'w' ? 'w' : 'b'];
        return pieces.map((piece, index) => {
            return (
                <div
                    key={`${piece}-${index}`}
                    className="w-6 h-6"
                >
                    <img
                        src={pieceImages[piece]}
                        alt={piece}
                        className="w-full h-full"
                    />
                </div>
            );
        });
    };

    useEffect(() => {
        const checkGameOver = () => {
            if (state.game.isGameOver() && !isModalOpen) {
                let result = '';

                // Create a new instance to ensure we have the latest state
                const currentGame = new Chess(state.game.fen());

                if (currentGame.isCheckmate()) {
                    // Get the previous turn since the player who just moved is the winner
                    const winner = currentGame.turn() === 'w' ? 'Black' : 'White';
                    result = `${winner} wins by checkmate!`;
                } else if (currentGame.isDraw()) {
                    if (currentGame.isStalemate()) {
                        result = "Draw by stalemate";
                    } else if (currentGame.isThreefoldRepetition()) {
                        result = "Draw by repetition";
                    } else if (currentGame.isInsufficientMaterial()) {
                        result = "Draw by insufficient material";
                    } else {
                        result = "Draw";
                    }
                }

                if (result) {
                    setGameResult(result);
                    setIsModalOpen(true);
                    dispatch({ type: 'STOP_TIMER' });
                    playSound.gameEnd();
                }
            }
        };

        checkGameOver();
    }, [state.game, isModalOpen, dispatch]);


    const handleNewGame = useCallback(() => {
        dispatch({ type: 'NEW_GAME' });
        setIsModalOpen(false);
        setIsDraw(false);
        setGameResult("");
        playSound.gameStart();
    }, [dispatch]);

    useEffect(() => {
        playSound.gameStart();
    }, [])

    const handleSquareClick = (square) => {
        const game = state.game;

        const newPiece = game.get(square);
        if (newPiece && newPiece.color === game.turn()) {
            setSelectedPiece(square);
            setValidMoves(getValidMoves(square));
            return;
        }

        if (selectedPiece) {

            const moveAttempt = {
                from: selectedPiece,
                to: square,
                promotion: 'q', // always promote to queen for simplicity
            };

            try {
                const tempGame = new Chess(game.fen());
                const moveResult = tempGame.move(moveAttempt);

                if (moveResult.captured || moveResult.flags.includes('e')) {
                    playSound.capture();
                } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
                    playSound.castle();
                } else if (moveResult.flags.includes('p')) {
                    playSound.promote();
                } else if (tempGame.isCheck()) {
                    playSound.check();
                } else {
                    playSound.move();
                }

                dispatch({ type: 'MAKE_MOVE', move: moveAttempt });
                setSelectedPiece(null);
                setValidMoves([]);

                // Update evaluation after move
                const newEvaluation = calculateEvaluation(tempGame.fen());
                setEvaluation(newEvaluation);

                // Check for checkmate immediately after the move
                if (tempGame.isCheckmate()) {
                    const winner = tempGame.turn() === 'w' ? 'Black' : 'White';
                    setGameResult(`${winner} wins by checkmate!`);
                    setIsModalOpen(true);
                    dispatch({ type: 'STOP_TIMER' });
                    playSound.gameEnd();
                }

            } catch (error) {
                playSound.invalidMove();
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else {
            // Select a piece
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setSelectedPiece(square);
                setValidMoves(getValidMoves(square));
            }
        }
    };

    // Add useEffect to calculate initial evaluation
    useEffect(() => {
        const initialEvaluation = calculateEvaluation(state.game.fen());
        setEvaluation(initialEvaluation);
    }, []);

    const handlePieceDrop = useCallback((fromSquare, toSquare) => {
        const piece = state.game.get(fromSquare);

        const moveAttempt = {
            from: fromSquare,
            to: toSquare,
            promotion: 'q'
        };

        try {
            const tempGame = new Chess(state.game.fen());
            const moveResult = tempGame.move(moveAttempt);

            // Play appropriate sound
            if (moveResult.captured || moveResult.flags.includes('e')) {
                playSound.capture();
            } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
                playSound.castle();
            } else if (moveResult.flags.includes('p')) {
                playSound.promote();
            } else if (tempGame.isCheck()) {
                playSound.check();
            } else {
                playSound.move();
            }

            dispatch({ type: 'MAKE_MOVE', move: moveAttempt });

            // Check for game over conditions
            if (tempGame.isGameOver()) {
                let result = "";
                if (tempGame.isCheckmate()) {
                    result = `${tempGame.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`;
                } else if (tempGame.isDraw()) {
                    if (tempGame.isStalemate()) result = "Draw by stalemate";
                    else if (tempGame.isThreefoldRepetition()) result = "Draw by repetition";
                    else if (tempGame.isInsufficientMaterial()) result = "Draw by insufficient material";
                    else result = "Draw";
                }
                setGameResult(result);
                setIsModalOpen(true);
                dispatch({ type: 'STOP_TIMER' });
                playSound.gameEnd();
            }
        } catch (error) {
            playSound.invalidMove();
        }
    }, [state.game, dispatch]);

    const calculateEvaluation = (position) => {
        const game = new Chess(position);

        // If it's the initial position, return 0
        if (game.fen() === new Chess().fen()) {
            return 0;
        }

        // Basic material count
        const pieceValues = {
            'p': 1,
            'n': 3,
            'b': 3,
            'r': 5,
            'q': 9
        };

        let evaluation = 0;

        // Count material
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = String.fromCharCode(97 + j) + (8 - i);
                const piece = game.get(square);
                if (piece) {
                    const value = pieceValues[piece.type.toLowerCase()] || 0;
                    evaluation += piece.color === 'w' ? value : -value;
                }
            }
        }

        // Add position evaluation
        if (game.isCheckmate()) {
            evaluation = game.turn() === 'w' ? -100 : 100;
        }

        return evaluation;
    };


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="bg-gray-900 p-3 min-h-screen">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">

                    {/* Left Side - Game Area */}
                    <div className="w-full lg:flex-1 flex flex-col">

                        {/* Black Timer & Captured Pieces */}
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-white text-base sm:text-lg">Black (1500)</span>
                                <div className="flex gap-0.5">
                                    {renderCapturedPieces('b')}
                                </div>
                            </div>
                            <div
                                className={`px-3 py-1 rounded text-base sm:text-lg transition-all duration-200 
                                ${isPlayerTurn('b') ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg scale-105' : 'bg-gray-700 text-gray-300'}`}>
                                {formatTime(state.timeLeft.b)}
                            </div>
                        </div>

                        {/* Chess Board and Evaluation */}
                        <div className="flex justify-center items-start w-full gap-2 overflow-x-auto">
                            {/* Evaluation Bar */}
                            <div className="w-4 sm:w-5 md:w-6 h-full">
                                <EvaluationBar position={state.game.fen()} />
                            </div>

                            {/* Board */}
                            <div className="relative aspect-square w-full max-w-[90vw] sm:max-w-[500px]">
                                <Board
                                    position={state.game.fen()}
                                    onSquareClick={handleSquareClick}
                                    selectedPiece={selectedPiece}
                                    validMoves={validMoves}
                                    lastMove={state.lastMove}
                                    onPieceDrop={handlePieceDrop}
                                />
                            </div>
                        </div>


                        {/* White Timer & Captured Pieces */}
                        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-white text-base sm:text-lg">White (1600)</span>
                                <div className="flex gap-0.5">
                                    {renderCapturedPieces('w')}
                                </div>
                            </div>
                            <div
                                className={`px-3 py-1 rounded text-base sm:text-lg transition-all duration-200 
                                 ${isPlayerTurn('w') ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg scale-105' : 'bg-gray-700 text-gray-300'}`}>
                                {formatTime(state.timeLeft.w)}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-64 flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/analysis')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base"
                        >
                            Analyze Game
                        </button>

                        {/* Move notation */}
                        <div className="bg-gray-800 rounded-lg p-4 flex-1">
                            <MoveNotation moves={state.history} />
                        </div>

                        {/* Game controls */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <GameControls
                                onResign={handleResign}
                                onDrawOffer={handleDrawOffer}
                            />
                        </div>
                    </div>
                </div>

                {/* Game Over Modal */}
                <GameOverModal
                    isOpen={isModalOpen}
                    result={gameResult}
                    onNewGame={handleNewGame}
                    onAcceptDraw={handleAcceptDraw}
                    onDeclineDraw={handleDeclineDraw}
                    isDraw={isDraw}
                />
            </div>
        </DndProvider>
    );
}

export default ClassicGame;