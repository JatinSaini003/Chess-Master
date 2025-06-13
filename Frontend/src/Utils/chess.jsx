export function parseFen(fen) {
    const board = [];
    const [position] = fen.split(' ');
    const rows = position.split('/');

    for (const row of rows) {
        for (const char of row) {
            if (isNaN(char)) {
                board.push(char);
            } else {
                for (let i = 0; i < parseInt(char); i++) {
                    board.push(null);
                }
            }
        }
    }

    return board;
}

export function getSquareColor(file, rank) {
    return (file + rank) % 2 === 0 ? 'light' : 'dark';
}

export function formatMove(move) {
    return `${move.from}${move.to}${move.promotion ? move.promotion : ''}`;
}