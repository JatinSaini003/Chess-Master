// components/Board/Board.jsx
import React from 'react';
import Square from './Square';
import { Chess } from 'chess.js';

function Board({ position, onSquareClick, selectedPiece, validMoves = [], lastMove, onPieceDrop, premove }) {
    const game = new Chess(position);

    // Parse FEN into 64-square board array
    const parseFen = (fen) => {
        const board = Array(64).fill(null);
        const [piecePlacement] = fen.split(' ');
        let squareIndex = 0;

        for (const char of piecePlacement) {
            if (char === '/') continue;
            if (/\d/.test(char)) {
                squareIndex += parseInt(char);
            } else {
                board[squareIndex++] = char;
            }
        }

        return board;
    };

    // Find the square of the current player's king
    const findKingSquare = () => {
        const turn = game.turn(); // 'w' or 'b'
        for (let i = 0; i < 64; i++) {
            const file = i % 8;
            const rank = Math.floor(i / 8);
            const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
            const piece = game.get(square);
            if (piece?.type === 'k' && piece.color === turn) {
                return square;
            }
        }
        return null;
    };

    const isInCheck = game.isCheck();
    const checkedKingSquare = isInCheck ? findKingSquare() : null;
    const pieces = parseFen(position);

    const handleDrop = (fromSquare, toSquare) => {
        if (fromSquare !== toSquare) {
            onPieceDrop(fromSquare, toSquare);
        }
    };

    return (
        <div className="w-full max-w-[min(100vw,calc(100vh-160px))] mx-auto px-2 sm:px-0">
            <div className="flex">
                {/* Rank coordinates (1–8) on the left side */}
                <div className="flex flex-col justify-around pr-1 sm:pr-2">
                    {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                        <div key={rank} className="text-gray-400 text-[10px] sm:text-xs h-[12.5%] flex items-center">
                            {rank}
                        </div>
                    ))}
                </div>

                {/* Chessboard itself */}
                <div className="relative flex-grow">
                    <div className="absolute inset-0">
                        <div className="grid grid-cols-8 border border-gray-600">
                            {pieces.map((piece, i) => {
                                const file = i % 8;
                                const rank = Math.floor(i / 8);
                                const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
                                const isLight = (file + rank) % 2 === 0;
                                const isLastMove = lastMove?.from === square || lastMove?.to === square;
                                const isChecked = square === checkedKingSquare;
                                const isValidMove = validMoves.includes(square);

                                return (
                                    <Square
                                        key={square}
                                        square={square}
                                        piece={piece}
                                        isLight={isLight}
                                        isSelected={selectedPiece === square}
                                        isValidMove={isValidMove}
                                        isLastMove={isLastMove}
                                        isChecked={isChecked}
                                        onClick={() => onSquareClick(square)}
                                        onDrop={handleDrop}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="pt-[100%]" /> {/* Square ratio preservation */}
                </div>
            </div>

            {/* File coordinates (a–h) below the board */}
            <div className="grid grid-cols-8 w-full pl-4 sm:pl-6 mt-1">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                    <div key={file} className="text-center text-gray-400 text-[10px] sm:text-xs">
                        {file}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Board;