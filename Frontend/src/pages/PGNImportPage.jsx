// src/pages/PGNImportPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';

function PGNImportPage() {
    const [importedPGN, setImportedPGN] = useState('');
    const [importError, setImportError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [importedGameData, setImportedGameData] = useState(null);
    const [gameMetadata, setGameMetadata] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const parsePGNMetadata = (pgnContent) => {
        const metadata = {
            Event: 'Unknown Event',
            Site: 'Unknown Site',
            Date: 'Unknown Date',
            Round: 'Unknown Round',
            White: 'Unknown White Player',
            Black: 'Unknown Black Player',
            Result: 'Unknown Result',
            WhiteElo: 'N/A',
            BlackElo: 'N/A',
            TimeControl: 'N/A',
            Termination: 'N/A',
            ECO: 'N/A'
        };

        // Regex to extract metadata
        const metadataRegex = /\[(\w+)\s+"([^"]+)"\]/g;
        let match;

        while ((match = metadataRegex.exec(pgnContent)) !== null) {
            const [, key, value] = match;

            // Populate metadata with extracted values
            switch (key) {
                case 'Event': metadata.Event = value; break;
                case 'Site': metadata.Site = value; break;
                case 'Date': metadata.Date = value; break;
                case 'Round': metadata.Round = value; break;
                case 'White': metadata.White = value; break;
                case 'Black': metadata.Black = value; break;
                case 'Result': metadata.Result = value; break;
                case 'WhiteElo': metadata.WhiteElo = value; break;
                case 'BlackElo': metadata.BlackElo = value; break;
                case 'TimeControl': metadata.TimeControl = value; break;
                case 'Termination': metadata.Termination = value; break;
                case 'ECO': metadata.ECO = value; break;
            }
        }

        return metadata;
    };

    const extractMovesFromPGN = (pgnContent) => {
        // Remove metadata and headers
        const movesSection = pgnContent.replace(/\[.*?\]/g, '').trim();

        // Remove result and comments
        const cleanedMoves = movesSection
            .replace(/\{[^}]*\}/g, '')  // Remove comments
            .replace(/\([^)]*\)/g, '')  // Remove variations
            .replace(/1-0|0-1|1\/2-1\/2|\*/g, '')  // Remove result
            .replace(/\d+\./g, '')  // Remove move numbers
            .trim();

        // Split moves and filter out empty strings
        return cleanedMoves
            .split(/\s+/)
            .filter(move => move.length > 0);
    };

    const processImportedPGN = (pgnContent) => {
        try {
            // Extract metadata
            const metadata = parsePGNMetadata(pgnContent);

            // Extract moves
            const moves = extractMovesFromPGN(pgnContent);

            // Replay moves
            const game = new Chess();
            const validMoves = [];

            for (const move of moves) {
                try {
                    game.move(move);
                    validMoves.push(move);
                } catch (moveError) {
                    console.warn(`Skipping invalid move: ${move}`);
                }
            }

            // Create a structured game object
            const gameData = {
                metadata: metadata,
                moves: validMoves,
                startFen: game.fen(),
                originalPGN: pgnContent
            };

            // Store game data
            setImportedGameData(gameData);

            // Set metadata
            setGameMetadata(metadata);

            setImportError('');
            setIsLoading(false);
        } catch (error) {
            console.error('PGN Import Error:', error);
            setImportError(`Error importing PGN: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const pgnContent = e.target.result;
                processImportedPGN(pgnContent);
            };
            reader.readAsText(file);
        }
    };

    const handleManualPGNImport = () => {
        if (importedPGN.trim()) {
            setIsLoading(true);
            processImportedPGN(importedPGN);
        }
    };

    const navigateToGameReplay = () => {
        navigate('/game-replay', {
            state: {
                importedGame: importedGameData,
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#1a1b1e] p-6">
            <div className="container mx-auto max-w-2xl">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    PGN Import
                </h1>

                <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
                    {/* File Upload Section */}
                    <div className="mb-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pgn"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center"
                        >
                            Upload PGN File
                        </button>
                    </div>

                    {/* Manual PGN Input */}
                    <div className="mb-4">
                        <textarea
                            value={importedPGN}
                            onChange={(e) => setImportedPGN(e.target.value)}
                            placeholder="Paste PGN here... (Include metadata and moves)"
                            className="w-full h-40 bg-[#2c2d32] text-white p-2 rounded mb-2 resize-none"
                        />
                        <button
                            onClick={handleManualPGNImport}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                        >
                            Import PGN
                        </button>
                    </div>

                    {/* Loading and Error States */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                            <span className="ml-2 text-white">Processing PGN...</span>
                        </div>
                    )}

                    {importError && (
                        <div className="bg-red-500/10 border border-red-500 rounded p-3 text-red-400 text-center">
                            {importError}
                        </div>
                    )}

                    {/* Game Replay Option */}
                    {importedGameData && !isLoading && (
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={navigateToGameReplay}
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                Replay Game
                            </button>
                            <button
                                onClick={() => navigate('/analysis', {
                                    state: {
                                        importedGame: importedGameData,
                                        gameMetadata: gameMetadata
                                    }
                                })}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                Full Analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PGNImportPage;