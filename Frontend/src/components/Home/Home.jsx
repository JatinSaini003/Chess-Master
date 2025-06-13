import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Home() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center w-full max-w-6xl"
            >
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                    Welcome to Chess Master
                </h1>
                <p className="text-base sm:text-xl text-gray-300 mb-8">
                    Play, analyze, and improve your chess game
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12">
                    <Link to="/play">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-6 rounded-lg shadow-lg"
                        >
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">Play Chess</h2>
                            <p>Challenge yourself or play against others</p>
                        </motion.div>
                    </Link>

                    <Link to="/pgn-import">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-green-600 hover:bg-green-700 text-white p-4 sm:p-6 rounded-lg shadow-lg"
                        >
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">Import PGN</h2>
                            <p>Replay your games</p>
                        </motion.div>
                    </Link>
                </div>

                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <FeatureCard
                            title="Classic Chess"
                            description="Play the traditional game with full rules and move validation"
                            icon="♟️"
                        />
                        <FeatureCard
                            title="Game Analysis"
                            description="Get instant feedback and improvement suggestions"
                            icon="📊"
                        />
                        <FeatureCard
                            title="Move History"
                            description="Review your game moves and learn from them"
                            icon="📝"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function FeatureCard({ title, description, icon }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg"
        >
            <div className="text-3xl sm:text-4xl mb-2">{icon}</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-sm sm:text-base">{description}</p>
        </motion.div>
    );
}

export default Home;