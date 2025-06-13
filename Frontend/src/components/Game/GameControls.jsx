import React from 'react';

function GameControls({ onResign, onDrawOffer }) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full mt-4">
            <button
                onClick={onResign}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm sm:text-base transition-colors"
            >
                Resign
            </button>
            <button
                onClick={onDrawOffer}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm sm:text-base transition-colors"
            >
                Offer Draw
            </button>
        </div>
    );
}

export default GameControls;
