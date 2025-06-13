// components/Board/Board.js
import React from 'react';
import Square from './Square';
import { Chess } from 'chess.js';

function Board({ position, onSquareClick, selectedPiece, validMoves = [], lastMove, onPieceDrop, premove }) {
    const game = new Chess(position);

    // Parse FEN string to get piece positions
    const parseFen = (fen) => {
        const board = new Array(64).fill(null);
        const [position] = fen.split(' ');
        let square = 0;

        for (const char of position) {
            if (char === '/') {
                continue;
            } else if (/\d/.test(char)) {
                square += parseInt(char);
            } else {
                board[square] = char;
                square += 1;
            }
        }

        return board;
    };

    const findKingPosition = () => {
        const turn = game.turn();
        for (let i = 0; i < 64; i++) {
            const file = i % 8;
            const rank = Math.floor(i / 8);
            const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
            const piece = game.get(square);
            if (piece && piece.type === 'k' && piece.color === turn) {
                return square;
            }
        }
        return null;
    };

    const isInCheck = game.isCheck();
    const checkedKingSquare = isInCheck ? findKingPosition() : null;

    const pieces = parseFen(position);

    const handleDrop = (fromSquare, toSquare) => {
        if (fromSquare === toSquare) return;
        onPieceDrop(fromSquare, toSquare);
    };

    return (
        <div className="w-full max-w-[calc(100vh-160px)] mx-auto">

            <div className="flex">
                {/* Rank coordinates (1-8) on the left */}
                <div className="flex flex-col justify-around pr-2">
                    {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                        <div key={rank} className="text-gray-400 text-xs h-[12.5%] flex items-center">
                            {rank}
                        </div>
                    ))}
                </div>

                <div className="relative flex-grow">
                    <div className="absolute inset-0">
                        <div className="grid grid-cols-8 gap-0 border border-gray-700 flex-grow">
                            {pieces.map((piece, i) => {
                                const file = i % 8;
                                const rank = Math.floor(i / 8);
                                const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
                                const isLight = (file + rank) % 2 === 0;
                                const isLastMove = lastMove && (square === lastMove.from || square === lastMove.to);
                                const isChecked = square === checkedKingSquare;;
                                const isValidMove = validMoves.includes(square) || false;

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
                    <div className="pt-[100%]" />
                </div>

            </div>

            {/* File coordinates (a-h) at the bottom */}
            <div className="grid grid-cols-8 w-full pl-6 mt-1">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
                    <div key={file} className="text-center text-gray-400 text-xs">
                        {file}
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Board;