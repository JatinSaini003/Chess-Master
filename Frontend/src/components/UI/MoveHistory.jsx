// frontend/src/components/UI/MoveHistory.js
import React from 'react';
import { motion } from 'framer-motion';

function MoveHistory({ moves }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg mb-4">Move History</h3>
      <div className="grid grid-cols-2 gap-2">
        {moves.map((move, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-white"
          >
            {index % 2 === 0 && <span className="text-gray-400">{Math.floor(index / 2) + 1}.</span>}
            {move.san}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MoveHistory;