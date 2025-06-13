import React, { useEffect, useRef, useState } from 'react';

function MoveNotation({ moves }) {
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [moves]);

    const handleMoveClick = (index) => {
        setSelectedMoveIndex(selectedMoveIndex === index ? null : index);
    };

    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            moveNumber: Math.floor(i / 2) + 1,
            white: moves[i],
            black: moves[i + 1],
        });
    }

    return (
        <div className="h-full">
            <h3 className="text-white text-base sm:text-lg font-semibold mb-2">Moves</h3>
            <div
                ref={scrollRef}
                className="bg-gray-900 p-2 rounded max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            >
                {movePairs.map((pair, index) => (
                    <div
                        key={index}
                        className={`flex text-xs sm:text-sm rounded px-2 py-1 cursor-pointer
              ${selectedMoveIndex === index ? 'bg-blue-600' : 'hover:bg-gray-800'}
              transition-colors duration-200`}
                        onClick={() => handleMoveClick(index)}
                    >
                        <span className="text-gray-500 w-6 sm:w-8 text-right pr-2 select-none">
                            {pair.moveNumber}.
                        </span>
                        <span className="text-white min-w-[3rem] flex items-center">
                            {pair.white}
                            {index === movePairs.length - 1 && !pair.black && (
                                <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
                            )}
                        </span>
                        {pair.black && (
                            <span className="text-white min-w-[3rem] ml-4">
                                {pair.black}
                                {index === movePairs.length - 1 && (
                                    <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
                                )}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MoveNotation;