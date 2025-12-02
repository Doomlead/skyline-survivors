// ------------------------
// Game configuration and state
// ------------------------

const CONFIG = {
    width: 1000,
    height: 500,
    worldWidth: 4000,
    worldHeight: 500
};

// Game state
const gameState = {
    score: 0,
    humans: 15,
    humansRescued: 0,
    smartBombs: 3,
    lives: 3,
    paused: false,
    gameOver: false,
    difficulty: 1,
    wave: 1,
    mode: null,
    timeRemaining: 0,
    enemiesToKillThisWave: 0,
    killsThisWave: 0,
    nextExtraLife: 10000,
    bossActive: false,
    currentBossKey: null,
    currentBossName: '',
    pendingBossWave: null,
    bossesDefeated: 0,
    bossQueue: [],
    classicBossFlags: { 10: false, 20: false, 30: false },
    survivalBossFlags: { 10: false, 20: false, 30: false },
    survivalBossesDefeated: 0,
    totalSurvivalDuration: 30 * 60 * 1000
};

// Player state
const playerState = {
    fireRate: 200,
    lastFire: 0,
    lastExhaustTime: 0,
    powerUps: {
        laser: 0,
        drone: 0,
        shield: 0,
        missile: 0,
        overdrive: 0,
        rearShot: 0,
        sideShot: 0,
        rapid: 0,
        multiShot: 0,
        piercing: 0,
        speed: 0,
        magnet: 0,
        double: 0,
        invincibility: 0,
        timeSlow: 0
    },
    direction: 'right',
    baseSpeed: 300
};

// Game objects (initialized in scene)
let player;
let cursors;
let spaceKey;
let shiftKey;
let qKey;
let rKey;
let pKey;
let enemies;
let projectiles;
let enemyProjectiles;
let powerUps;
let humans;
let drones;
let explosions;
let bosses;

// UI elements
let scoreText;
let livesText;
let humansText;
let smartBombsText;
let powerUpIndicators;
let radarGraphics;
let timerText;
let uiContainer;

// Global audio manager instance
let audioManager;

// Global particle manager instance
let particleManager;

// Virtual input for touch controls
window.virtualInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false
};

// Reset game state function
function resetGameState() {
    gameState.score = 0;
    gameState.humans = 15;
    gameState.humansRescued = 0;
    gameState.smartBombs = 3;
    gameState.lives = 3;
    gameState.paused = false;
    gameState.gameOver = false;
    gameState.difficulty = 1;
    gameState.wave = 1;
    gameState.enemiesToKillThisWave = 0;
    gameState.killsThisWave = 0;
    gameState.timeRemaining = 0;
    gameState.nextExtraLife = 10000;
    playerState.fireRate = 200;
    playerState.lastFire = 0;
    playerState.lastExhaustTime = 0;
    playerState.powerUps = {
        laser: 0,
        drone: 0,
        shield: 0,
        missile: 0,
        overdrive: 0,
        rearShot: 0,
        sideShot: 0,
        rapid: 0,
        multiShot: 0,
        piercing: 0,
        speed: 0,
        magnet: 0,
        double: 0,
        invincibility: 0,
        timeSlow: 0
    };
    playerState.direction = 'right';

    gameState.bossActive = false;
    gameState.currentBossKey = null;
    gameState.currentBossName = '';
    gameState.pendingBossWave = null;
    gameState.bossesDefeated = 0;
    gameState.bossQueue = [];
    gameState.classicBossFlags = { 10: false, 20: false, 30: false };
    gameState.survivalBossFlags = { 10: false, 20: false, 30: false };
    gameState.survivalBossesDefeated = 0;
}
