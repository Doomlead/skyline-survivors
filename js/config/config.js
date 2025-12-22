// ------------------------
// Game configuration and state
// ------------------------

const SCENE_KEYS = {
    menu: 'MainMenuScene',
    game: 'GameScene',
    build: 'BuildScene'
};

const CONFIG = {
    width: 1000,
    height: 500,
    worldWidth: 4000,
    worldHeight: 500
};

// Player-facing settings (audio + accessibility)
const SETTINGS_STORAGE_KEY = 'skyline_user_settings_v1';
const userSettings = {
    musicVolume: 0.6,
    sfxVolume: 0.7,
    reduceFlashes: false,
    muted: false
};

function loadUserSettings() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return;

    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            if (typeof parsed.musicVolume === 'number') userSettings.musicVolume = Phaser.Math.Clamp(parsed.musicVolume, 0, 1);
            if (typeof parsed.sfxVolume === 'number') userSettings.sfxVolume = Phaser.Math.Clamp(parsed.sfxVolume, 0, 1);
            if (typeof parsed.reduceFlashes === 'boolean') userSettings.reduceFlashes = parsed.reduceFlashes;
            if (typeof parsed.muted === 'boolean') userSettings.muted = parsed.muted;
        }
    } catch (err) {
        // Ignore malformed storage
    }
}

function persistUserSettings() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
}

function isFlashReductionEnabled() {
    return !!userSettings.reduceFlashes;
}

loadUserSettings();

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
    mode: 'classic',
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
    classicBossFlags: { 5: false, 10: false, 15: false },
    survivalBossFlags: { 5: false, 10: false, 15: false },
    survivalBossesDefeated: 0,
    totalSurvivalDuration: 15 * 60 * 1000,
    missionContext: null,
    missionDirectives: null,
    missionDistrictState: null,
    rewardMultiplier: 1,
    spawnMultiplier: 1,
    metaAppliedLoadout: null,
    metaRewardsGranted: false
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

// Secondary cameras used to display wrapped world edges
let wrapCamera;

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
    gameState.classicBossFlags = { 5: false, 10: false, 15: false };
    gameState.survivalBossFlags = { 5: false, 10: false, 15: false };
    gameState.survivalBossesDefeated = 0;
    gameState.missionContext = null;
    gameState.missionDirectives = null;
    gameState.rewardMultiplier = 1;
    gameState.spawnMultiplier = 1;
    gameState.metaAppliedLoadout = null;
    gameState.metaRewardsGranted = false;
}
