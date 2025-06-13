// src/services/stockfish.service.js

class StockfishService {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.depth = 20;
        this.onMessageCallbacks = new Set();
        this.currentEvaluation = null;
        this.bestMove = null;
        this.wasmSupported = typeof WebAssembly === 'object';
    }

    async initialize() {
        if (this.engine) return;

        try {
            // Dynamic import of Stockfish
            // @ts-ignore
            const stockfishModule = await import('stockfish.js');
            this.engine = new Worker(stockfishModule.default);

            this.engine.onmessage = (event) => {
                const message = event.data;
                this.handleEngineMessage(message);
                this.onMessageCallbacks.forEach(callback => callback(message));
            };

            this.engine.onerror = (error) => {
                console.error('Stockfish error:', error);
                this.isReady = false;
            };

            this.sendCommand('uci');
            this.sendCommand('isready');
            this.sendCommand('setoption name MultiPV value 3');
            this.sendCommand('ucinewgame');

            // Wait for engine to be ready
            await new Promise((resolve) => {
                const checkReady = (message) => {
                    if (message === 'readyok') {
                        this.removeMessageListener(checkReady);
                        resolve();
                    }
                };
                this.addMessageListener(checkReady);
            });

            this.isReady = true;
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            throw error;
        }
    }

    handleEngineMessage(message) {
        if (typeof message !== 'string') return;

        if (message.includes('bestmove')) {
            const matches = message.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
            if (matches) {
                this.bestMove = {
                    move: matches[1],
                    ponder: matches[2] || null
                };
            }
        } else if (message.includes('score cp')) {
            const matches = message.match(/score cp (-?\d+)/);
            if (matches) {
                this.currentEvaluation = parseInt(matches[1]) / 100;
            }
        } else if (message.includes('score mate')) {
            const matches = message.match(/score mate (-?\d+)/);
            if (matches) {
                const moves = parseInt(matches[1]);
                this.currentEvaluation = moves > 0 ? Infinity : -Infinity;
            }
        }
    }

    sendCommand(command) {
        if (this.engine && this.isReady) {
            this.engine.postMessage(command);
        }
    }

    addMessageListener(callback) {
        this.onMessageCallbacks.add(callback);
        return () => this.onMessageCallbacks.delete(callback);
    }

    removeMessageListener(callback) {
        this.onMessageCallbacks.delete(callback);
    }

    evaluatePosition(fen, depth = this.depth) {
        return new Promise((resolve) => {
            if (!this.engine || !this.isReady) {
                resolve({ evaluation: 0, bestMove: null, depth: 0 });
                return;
            }

            const handleMessage = (message) => {
                if (message.includes('bestmove')) {
                    removeListener();
                    resolve({
                        evaluation: this.currentEvaluation,
                        bestMove: this.bestMove,
                        depth: depth
                    });
                }
            };

            const removeListener = this.addMessageListener(handleMessage);
            this.sendCommand(`position fen ${fen}`);
            this.sendCommand(`go depth ${depth}`);
        });
    }

    getBestMove(fen, depth = this.depth) {
        return new Promise((resolve) => {
            if (!this.engine || !this.isReady) {
                resolve(null);
                return;
            }

            const handleMessage = (message) => {
                if (message.includes('bestmove')) {
                    removeListener();
                    resolve(this.bestMove);
                }
            };

            const removeListener = this.addMessageListener(handleMessage);
            this.sendCommand(`position fen ${fen}`);
            this.sendCommand(`go depth ${depth}`);
        });
    }

    getTopMoves(fen, numMoves = 3, depth = this.depth) {
        return new Promise((resolve) => {
            if (!this.engine || !this.isReady) {
                resolve([]);
                return;
            }

            const moves = [];

            const handleMessage = (message) => {
                if (message.includes('multipv') && message.includes('pv')) {
                    const matches = message.match(/multipv (\d+) .*score cp (-?\d+) .*pv (.+?)(?=\s+(?:multipv|$))/);
                    if (matches) {
                        const [, pvNum, score, moveSequence] = matches;
                        moves[parseInt(pvNum) - 1] = {
                            evaluation: parseInt(score) / 100,
                            sequence: moveSequence.trim().split(' ')
                        };
                    }
                } else if (message.includes('bestmove')) {
                    removeListener();
                    resolve(moves.filter(Boolean));
                }
            };

            const removeListener = this.addMessageListener(handleMessage);
            this.sendCommand(`setoption name MultiPV value ${numMoves}`);
            this.sendCommand(`position fen ${fen}`);
            this.sendCommand(`go depth ${depth}`);
        });
    }

    analyzePosition(fen, depth = this.depth) {
        return new Promise((resolve) => {
            if (!this.engine || !this.isReady) {
                resolve({
                    evaluation: 0,
                    bestMove: null,
                    topMoves: [],
                    mate: null,
                    depth: 0
                });
                return;
            }

            let analysis = {
                evaluation: null,
                bestMove: null,
                topMoves: [],
                mate: null,
                depth: 0
            };

            const handleMessage = (message) => {
                if (typeof message !== 'string') return;

                // Parse evaluation
                if (message.includes('score cp')) {
                    const matches = message.match(/score cp (-?\d+)/);
                    if (matches) {
                        analysis.evaluation = parseInt(matches[1]) / 100;
                    }
                }
                // Parse mate
                else if (message.includes('score mate')) {
                    const matches = message.match(/score mate (-?\d+)/);
                    if (matches) {
                        analysis.mate = parseInt(matches[1]);
                    }
                }
                // Parse MultiPV lines
                if (message.includes('multipv') && message.includes('pv')) {
                    const matches = message.match(/multipv (\d+) .*score (?:cp|mate) (-?\d+) .*pv (.+?)(?=\s+(?:multipv|$))/);
                    if (matches) {
                        const [, pvNum, score, moveSequence] = matches;
                        analysis.topMoves[parseInt(pvNum) - 1] = {
                            evaluation: parseInt(score) / 100,
                            sequence: moveSequence.trim().split(' ')
                        };
                    }
                }
                // Parse depth
                if (message.includes('depth')) {
                    const matches = message.match(/depth (\d+)/);
                    if (matches) {
                        analysis.depth = parseInt(matches[1]);
                    }
                }
                // Resolve when analysis is complete
                if (message.includes('bestmove')) {
                    const matches = message.match(/bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/);
                    if (matches) {
                        analysis.bestMove = {
                            move: matches[1],
                            ponder: matches[2] || null
                        };
                    }
                    removeListener();
                    resolve(analysis);
                }
            };

            const removeListener = this.addMessageListener(handleMessage);
            this.sendCommand(`setoption name MultiPV value 3`);
            this.sendCommand(`position fen ${fen}`);
            this.sendCommand(`go depth ${depth}`);
        });
    }

    stop() {
        if (this.engine && this.isReady) {
            this.sendCommand('stop');
        }
    }

    quit() {
        if (this.engine) {
            this.sendCommand('quit');
            this.engine.terminate();
            this.engine = null;
            this.isReady = false;
        }
    }
}

export const stockfishService = new StockfishService();