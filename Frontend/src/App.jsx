import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChessProvider } from './context/chessContext';
import Navbar from './components/UI/Navbar';
import ClassicGame from './components/Game/ClassicGame';
import { Analysis } from './components/Analysis';
import Home from './components/Home/Home';
import GameReplay from './components/Game/GameReplay';
import PGNImportPage from './pages/PGNImportPage';

function App() {
  return (
    <ChessProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <Navbar />
          <main className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<ClassicGame />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/game-replay" element={<GameReplay />} />
              <Route path="/pgn-import" element={<PGNImportPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ChessProvider>
  );
}

export default App;