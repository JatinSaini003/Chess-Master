// src/Data/openings.js
export const OPENINGS_DATABASE = [
    {
        name: "Ruy Lopez",
        eco: "C60-C99",
        description: "A classic opening that begins with 1.e4 e5 2.Nf3 Nc6 3.Bb5",
        lines: [
            "Main Line: 3...a6 4.Ba4 Nf6 5.O-O",
            "Morphy Defense: 3...f6",
            "Closed Variation: 3...Nf6 4.O-O"
        ],
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
        difficulty: "Advanced",
        popularity: "High"
    },
    {
        name: "Sicilian Defense",
        eco: "B20-B99",
        description: "A sharp and aggressive response to 1.e4",
        lines: [
            "Najdorf Variation: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6",
            "Dragon Variation: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6",
            "Classical Variation: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6"
        ],
        moves: ["e4", "c5"],
        difficulty: "Advanced",
        popularity: "Very High"
    },
    {
        name: "Italian Game",
        eco: "C50-C59",
        description: "A classic opening developing pieces quickly",
        lines: [
            "Giuoco Piano: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5",
            "Two Knights Defense: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6",
            "Evans Gambit: 1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4"
        ],
        moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
        difficulty: "Intermediate",
        popularity: "High"
    },
    {
        name: "Queen's Gambit",
        eco: "D00-D69",
        description: "A solid opening for White in the Queen's Pawn Game",
        lines: [
            "Accepted: 1.d4 d5 2.c4 dxc4",
            "Declined: 1.d4 d5 2.c4 e6",
            "Slav Defense: 1.d4 d5 2.c4 c6"
        ],
        moves: ["d4", "d5", "c4"],
        difficulty: "Advanced",
        popularity: "High"
    },
    {
        name: "French Defense",
        eco: "C00-C19",
        description: "A solid but somewhat passive response to 1.e4",
        moves: ["e4", "e6"],
        lines: [
            "Advance Variation: 1.e4 e6 2.d4 d5 3.e5",
            "Tarrasch Variation: 1.e4 e6 2.d4 d5 3.Nd2"
        ],
        difficulty: "Intermediate",
        popularity: "High"
    },
    {
        name: "Nimzo-Larsen Attack",
        eco: "A01",
        description: "A flank opening beginning with 1.b3, popularized by Bent Larsen",
        moves: ["b3", "e5", "Bb2", "Nc6"],
        lines: [
            "Classical Variation: 1.b3 e5 2.Bb2 Nc6 3.e3 Nf6",
            "Modern Variation: 1.b3 e5 2.Bb2 Nc6 3.f4"
        ],
        difficulty: "Intermediate",
        popularity: "Medium"
    }
];

export function identifyOpening(moves) {
    // Function to check if moves match an opening
    const matchOpening = (openingMoves) => {
        // If not enough moves, return false
        if (openingMoves.length > moves.length) return false;

        // Check each move in the opening
        return openingMoves.every((openingMove, index) =>
            moves[index] === openingMove
        );
    };

    // Find the first matching opening
    const matchedOpening = OPENINGS_DATABASE.find(opening =>
        matchOpening(opening.moves)
    );

    return matchedOpening || null;
}

export function getOpeningSuggestions(fen) {
    // More comprehensive suggestions based on the current position
    return [
        {
            name: "Develop Knight",
            nextMove: "Nf3",
            probability: 0.7
        },
        {
            name: "Control Center",
            nextMove: "d4",
            probability: 0.6
        },
        {
            name: "Castle Kingside",
            nextMove: "O-O",
            probability: 0.5
        }
    ];
}