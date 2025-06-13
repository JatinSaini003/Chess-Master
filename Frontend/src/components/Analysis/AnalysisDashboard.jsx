// src/components/Analysis/AnalysisDashboard.jsx
import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import MoveAccuracy from './AnalysisComponents/MoveAccuracy';
import TimeAnalysis from './AnalysisComponents/TimeAnalysis';
import OpeningAnalysis from './AnalysisComponents/OpeningAnalysis';
import MistakeAnalysis from './AnalysisComponents/MistakeAnalysis';
import EngineAnalysis from './EngineAnalysis';
import TacticsRecognition from './AnalysisComponents/TacticsRecognition';
import GameStatistics from './AnalysisComponents/GameStatistics';
import PGNTools from './AnalysisComponents/PGNTools';

function AnalysisDashboard({ game, moves, timeData }) {
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <Tab.Group onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-lg bg-gray-700 p-1">
                    <Tab className={({ selected }) => `
                        w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected
                            ? 'bg-blue-500 text-white shadow'
                            : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                    `}>
                        Analysis
                    </Tab>
                    <Tab className={({ selected }) => `
                        w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected
                            ? 'bg-blue-500 text-white shadow'
                            : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                    `}>
                        Statistics
                    </Tab>
                    <Tab className={({ selected }) => `
                        w-full rounded-lg py-2.5 text-sm font-medium leading-5
                        ${selected
                            ? 'bg-blue-500 text-white shadow'
                            : 'text-gray-400 hover:bg-gray-600 hover:text-white'}
                    `}>
                        Tools
                    </Tab>
                </Tab.List>

                <Tab.Panels className="mt-4">
                    <Tab.Panel>
                        <div className="grid grid-cols-2 gap-4">
                            <MoveAccuracy moves={moves} />
                            <TimeAnalysis timeData={timeData} />
                            <OpeningAnalysis game={game} />
                            <MistakeAnalysis moves={moves} />
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="grid grid-cols-2 gap-4">
                            <GameStatistics game={game} />
                            <EngineAnalysis />
                            <TacticsRecognition moves={moves} />
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <PGNTools game={game} />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}

export default AnalysisDashboard;