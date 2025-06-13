// src/components/Analysis/AnalysisComponents/TacticsRecognition.jsx
import React from 'react';

function TacticsRecognition({ moves }) {
    const recognizeTactic = (position) => {
        const tactics = [];

        // Check for fork
        if (isFork(position)) tactics.push('Fork');

        // Check for pin
        if (isPin(position)) tactics.push('Pin');

        // Check for skewer
        if (isSkewer(position)) tactics.push('Skewer');

        // Check for discovered attack
        if (isDiscoveredAttack(position)) tactics.push('Discovered Attack');

        return tactics;
    };

    return (
        <div className="bg-gray-700 rounded-lg p-4 sm:p-6 w-full">
            <h3 className="text-white text-lg sm:text-xl font-semibold mb-4">Tactics Recognition</h3>
            <div className="space-y-4">
                {moves.map((move, index) => {
                    const tactics = recognizeTactic(move.position);
                    if (tactics.length > 0) {
                        return (
                            <div key={index} className="text-white">
                                <span className="font-semibold block text-sm sm:text-base">
                                    Move {move.moveNumber}:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {tactics.map((tactic, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-blue-500 rounded text-xs sm:text-sm"
                                        >
                                            {tactic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

export default TacticsRecognition;