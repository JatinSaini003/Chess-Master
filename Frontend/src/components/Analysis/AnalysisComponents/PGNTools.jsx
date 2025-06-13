// src/components/Analysis/AnalysisComponents/PGNTools.jsx
import React, { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';

function PGNTools() {
    const [importedPGN, setImportedPGN] = useState('');
    const [importError, setImportError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [importedGameData, setImportedGameData] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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

    const processImportedPGN = (pgnContent) => {
        try {
            const tempGame = new Chess();
            if (tempGame.loadPgn(pgnContent)) {
                // Store the full PGN and game details
                setImportedGameData({
                    pgn: pgnContent,
                    moves: tempGame.history(),
                    startFen: tempGame.fen()
                });
                setImportError('');
                setIsLoading(false);
            } else {
                setImportError('Invalid PGN format');
                setIsLoading(false);
            }
        } catch (error) {
            setImportError('Error importing PGN: ' + error.message);
            setIsLoading(false);
        }
    };

    const handleManualPGNImport = () => {
        if (importedPGN.trim()) {
            setIsLoading(true);
            processImportedPGN(importedPGN);
        }
    };

    const navigateToGameReplay = () => {
        // Pass the imported game data to the replay page
        navigate('/game-replay', {
            state: {
                importedGame: importedGameData
            }
        });
    };

    return (
        <div className="bg-[#25262b] rounded-2xl p-6 shadow-xl">
            <h3 className="text-white text-xl font-semibold mb-4">PGN Import Tools</h3>

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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                    Upload PGN File
                </button>
            </div>

            {/* Manual PGN Input */}
            <div className="mb-4">
                <textarea
                    value={importedPGN}
                    onChange={(e) => setImportedPGN(e.target.value)}
                    placeholder="Or paste PGN here..."
                    className="w-full h-32 bg-[#2c2d32] text-white p-2 rounded mb-2 resize-none"
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
                <p className="text-red-400 text-sm mb-2 text-center">{importError}</p>
            )}

            {/* Game Replay Option */}
            {importedGameData && !isLoading && (
                <div className="mt-4">
                    <button
                        onClick={navigateToGameReplay}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        Replay Imported Game
                    </button>
                </div>
            )}
        </div>
    );
}

export default PGNTools;