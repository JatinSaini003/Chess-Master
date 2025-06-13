import moveSoundFile from '../assets/sounds/Move.mp3';
import captureSoundFile from '../assets/sounds/Capture.mp3';
import checkSoundFile from '../assets/sounds/Check.mp3';
import gameEndSoundFile from '../assets/sounds/Checkmate.mp3';
import gameStartSoundFile from '../assets/sounds/game-start.mp3';
import castleSoundFile from '../assets/sounds/Castle.mp3';
import promoteSoundFile from '../assets/sounds/Promote.mp3';
import invalidMoveSoundFile from '../assets/sounds/illegal.mp3';
import timeRunningSoundFile from '../assets/sounds/TimeRunning.mp3';

const moveSound = new Audio(moveSoundFile);
const captureSound = new Audio(captureSoundFile);
const checkSound = new Audio(checkSoundFile);
const gameEndSound = new Audio(gameEndSoundFile);
const gameStartSound = new Audio(gameStartSoundFile)
const castleSound = new Audio(castleSoundFile)
const promoteSound = new Audio(promoteSoundFile)
const invalidMoveSound = new Audio(invalidMoveSoundFile)
const timeRunningSound = new Audio(timeRunningSoundFile)

moveSound.load();
captureSound.load();
checkSound.load();
gameEndSound.load();
gameStartSound.load();
castleSound.load();
promoteSound.load();
invalidMoveSound.load();
timeRunningSound.load();

export const playSound = {
    move: () => {
        moveSound.currentTime = 0;
        moveSound.play().catch(err => console.log('Sound play failed:', err));
    },
    capture: () => {
        captureSound.currentTime = 0;
        captureSound.play().catch(err => console.log('Sound play failed:', err));
    },
    check: () => {
        checkSound.currentTime = 0;
        checkSound.play().catch(err => console.log('Sound play failed:', err));
    },
    gameEnd: () => {
        gameEndSound.currentTime = 0;
        gameEndSound.play().catch(err => console.log('Sound play failed:', err));
    },
    gameStart: () => {
        gameStartSound.currentTime = 0;
        gameStartSound.play().catch(err => console.log('Sound play failed:', err));
    },
    castle: () => {
        castleSound.currentTime = 0;
        castleSound.play().catch(err => console.log('Sound play failed:', err));
    },
    promote: () => {
        promoteSound.currentTime = 0;
        promoteSound.play().catch(err => console.log('Sound play failed:', err));
    },
    invalidMove: () => {
        invalidMoveSound.currentTime = 0;
        invalidMoveSound.play().catch(err => console.log('Sound play failed:', err));
    },
    timeRunning: () => {
        timeRunningSound.currentTime = 0;
        timeRunningSound.play().catch(err => console.log('Sound play failed:', err));
    }
};