// src/components/Game/GameReplay.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import Board from '../Board/Board';
import MoveNotation from './MoveNotation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    TrophyIcon,
    CalendarIcon,
    UserIcon,
    MapPinIcon,
    InformationCircleIcon
} from '@heroicons/react/24/solid';

function GameReplay() {
    const location = useLocation();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [currentMove, setCurrentMove] = useState(0);
    const [gameHistory, setGameHistory] = useState([]);
    const [gameMetadata, setGameMetadata] = useState({
        Event: 'Unknown Event',
        Site: 'Unknown Site',
        Date: 'Unknown Date',
        White: 'Unknown White Player',
        Black: 'Unknown Black Player',
        Result: 'Unknown Result',
        WhiteElo: 'N/A',
        BlackElo: 'N/A',
        TimeControl: 'N/A',
        Termination: 'N/A'
    });

    useEffect(() => {
        // Check if game data was passed
        if (!location.state?.importedGame) {
            navigate('/');
            return;
        }

        // Use metadata from the imported game
        const metadata = location.state.importedGame.metadata || {};

        // Merge extracted metadata with default values
        const mergedMetadata = {
            Event: metadata.Event || 'Unknown Event',
            Site: metadata.Site || 'Unknown Site',
            Date: metadata.Date || 'Unknown Date',
            White: metadata.White || 'Unknown White Player',
            Black: metadata.Black || 'Unknown Black Player',
            Result: metadata.Result || 'Unknown Result',
            WhiteElo: metadata.WhiteElo || 'N/A',
            BlackElo: metadata.BlackElo || 'N/A',
            TimeControl: metadata.TimeControl || 'N/A',
            Termination: metadata.Termination || 'N/A',
            ECO: metadata.ECO || 'N/A'
        };

        // Set the metadata
        setGameMetadata(mergedMetadata);

        // Initialize game with moves
        const newGame = new Chess();
        location.state.importedGame.moves.forEach(move => {
            newGame.move(move);
        });

        setGame(newGame);
        setGameHistory(location.state.importedGame.moves);
    }, [location.state, navigate]);

    // Determine game outcome description
    const getGameOutcomeDescription = () => {
        switch (gameMetadata.Result) {
            case '1-0':
                return `White won the game`;
            case '0-1':
                return `Black won the game`;
            case '1/2-1/2':
                return "Game ended in a draw";
            default:
                return "Game result unknown";
        }
    };

    // Determine termination reason
    const getTerminationReason = () => {
        if (gameMetadata.Termination && gameMetadata.Termination !== 'N/A') {
            return gameMetadata.Termination;
        }

        switch (gameMetadata.Result) {
            case '1-0':
                return "White wins";
            case '0-1':
                return "Black wins";
            case '1/2-1/2':
                return "Draw";
            default:
                return "Game outcome not specified";
        }
    };

    const handleNextMove = () => {
        if (currentMove < gameHistory.length) {
            const newGame = new Chess(game.fen());
            newGame.move(gameHistory[currentMove]);
            setGame(newGame);
            setCurrentMove(prev => prev + 1);
        }
    };

    const handlePreviousMove = () => {
        if (currentMove > 0) {
            const newGame = new Chess();
            gameHistory.slice(0, currentMove - 1).forEach(move => {
                newGame.move(move);
            });
            setGame(newGame);
            setCurrentMove(prev => prev - 1);
        }
    };

    const handleResetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setCurrentMove(0);
    };

    const renderMetadataSection = () => {
        if (!gameMetadata) return null;

        return (
            <div className="bg-[#2c2d32] rounded-xl p-4 space-y-3">
                <h3 className="text-white text-lg font-semibold mb-3 flex items-center">
                    <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-400" />
                    Game Details
                </h3>

                {/* Game Outcome */}
                <div className="bg-[#25262b] rounded p-3">
                    <div className="flex items-center">
                        <TrophyIcon className="h-5 w-5 mr-2 text-yellow-400" />
                        <span className="text-white font-medium">Result:</span>
                        <span className="ml-2 text-gray-300">
                            {gameMetadata.Result || 'N/A'} - {getGameOutcomeDescription()}
                        </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        {getTerminationReason()}
                    </div>
                </div>

                {/* Player Information */}
                <div className="grid md:grid-cols-2 gap-2">
                    <div className="bg-[#25262b] rounded p-3">
                        <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-white" />
                            <span className="text-gray-400">White Player:</span>
                        </div>
                        <div className="text-white font-semibold">
                            {gameMetadata.White || 'Unknown'}
                            {gameMetadata.WhiteElo && ` (${gameMetadata.WhiteElo})`}
                        </div>
                    </div>
                    <div className="bg-[#25262b] rounded p-3">
                        <div className="flex items-center">
                            <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                            <span className="text-gray-400">Black Player:</span>
                        </div>
                        <div className="text-white font-semibold">
                            {gameMetadata.Black || 'Unknown'}
                            {gameMetadata.BlackElo && ` (${gameMetadata.BlackElo})`}
                        </div>
                    </div>
                </div>

                {/* Additional Game Information */}
                <div className="grid md:grid-cols-3 gap-2">
                    <div className="bg-[#25262b] rounded p-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-green-400" />
                        <div>
                            <span className="text-gray-400 text-sm">Date</span>
                            <div className="text-white">{gameMetadata.Date || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="bg-[#25262b] rounded p-3 flex items-center">
                        <MapPinIcon className="h-5 w-5 mr-2 text-red-400" />
                        <div>
                            <span className="text-gray-400 text-sm">Event</span>
                            <div className="text-white">{gameMetadata.Event || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="bg-[#25262b] rounded p-3 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-purple-400" />
                        <div>
                            <span className="text-gray-400 text-sm">Time Control</span>
                            <div className="text-white">{gameMetadata.TimeControl || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Debug Information */}
                <div className="bg-[#25262b] rounded p-3">
                    <details>
                        <summary className="text-gray-400 cursor-pointer">
                            Raw Metadata (for debugging)
                        </summary>
                        <pre className="text-xs text-gray-300 mt-2">
                            {JSON.stringify(gameMetadata, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
        );
    };


    if (!game) return <div>Loading...</div>;

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-[#1a1b1e] p-6">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Game Replay</h1>
                        <button
                            onClick={() => navigate('/analysis', {
                                state: { importedGame: location.state.importedGame }
                            })}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Full Analysis
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Board Section */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-[#25262b] rounded-2xl p-6">
                                <Board
                                    position={game.fen()}
                                    orientation="white"
                                    onPieceDrop={() => { }}
                                />

                                {/* Move Navigation */}
                                <div className="flex justify-center mt-6 space-x-4">
                                    <button
                                        onClick={handlePreviousMove}
                                        disabled={currentMove === 0}
                                        className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleResetGame}
                                        className="bg-gray-700 text-white px-4 py-2 rounded"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleNextMove}
                                        disabled={currentMove >= gameHistory.length}
                                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {/* Move List Section */}
                            <div className="bg-[#25262b] rounded-2xl p-6">
                                <h2 className="text-white text-xl font-semibold mb-4">Move List</h2>
                                <div className="max-h-[600px] overflow-y-auto">
                                    <MoveNotation
                                        moves={gameHistory.slice(0, currentMove)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Metadata Section */}
                        <div className="md:col-span-1">
                            {renderMetadataSection()}
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}

export default GameReplay;