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

        const metadataRegex = /\[(\w+)\s+"([^"]+)"\]/g;
        let match;
        while ((match = metadataRegex.exec(pgnContent)) !== null) {
            const [, key, value] = match;
            if (metadata.hasOwnProperty(key)) metadata[key] = value;
        }

        return metadata;
    };

    const extractMovesFromPGN = (pgnContent) => {
        const movesSection = pgnContent.replace(/\[.*?\]/g, '').trim();
        const cleanedMoves = movesSection
            .replace(/\{[^}]*\}/g, '')
            .replace(/\([^)]*\)/g, '')
            .replace(/1-0|0-1|1\/2-1\/2|\*/g, '')
            .replace(/\d+\./g, '')
            .trim();

        return cleanedMoves.split(/\s+/).filter(move => move.length > 0);
    };

    const processImportedPGN = (pgnContent) => {
        try {
            const metadata = parsePGNMetadata(pgnContent);
            const moves = extractMovesFromPGN(pgnContent);
            const game = new Chess();
            const validMoves = [];

            for (const move of moves) {
                try {
                    game.move(move);
                    validMoves.push(move);
                } catch (err) {
                    console.warn(`Invalid move skipped: ${move}`);
                }
            }

            const gameData = {
                metadata,
                moves: validMoves,
                startFen: game.fen(),
                originalPGN: pgnContent
            };

            setImportedGameData(gameData);
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
            state: { importedGame: importedGameData }
        });
    };

    return (
        <div className="min-h-screen bg-[#1a1b1e] p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                    PGN Import
                </h1>

                <div className="bg-[#25262b] rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
                    {/* Upload PGN */}
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".pgn"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center transition"
                        >
                            Upload PGN File
                        </button>
                    </div>

                    {/* Manual PGN Text Area */}
                    <div>
                        <textarea
                            value={importedPGN}
                            onChange={(e) => setImportedPGN(e.target.value)}
                            placeholder="Paste PGN here... (Include metadata and moves)"
                            className="w-full h-40 bg-[#2c2d32] text-white p-3 rounded resize-none"
                        />
                        <button
                            onClick={handleManualPGNImport}
                            className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                        >
                            Import PGN
                        </button>
                    </div>

                    {/* Loading Spinner */}
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 text-white py-3">
                            <div className="animate-spin h-6 w-6 border-2 border-t-transparent rounded-full border-blue-500" />
                            <span>Processing PGN...</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {importError && (
                        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded text-center">
                            {importError}
                        </div>
                    )}

                    {/* Replay & Analyze Buttons */}
                    {importedGameData && !isLoading && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                onClick={navigateToGameReplay}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
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
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
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