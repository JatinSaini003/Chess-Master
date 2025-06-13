import React from 'react';

function GameControls({ onResign, onDrawOffer }) {
    return (
        <div className="flex gap-2">
            <button
                onClick={onResign}
                className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
                Resign
            </button>
            <button
                onClick={onDrawOffer}
                className="flex-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
            >
                Offer Draw
            </button>
        </div>
    );
}

export default GameControls;