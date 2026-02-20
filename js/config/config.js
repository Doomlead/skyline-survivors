//
// js/config/config.js
//

const SCENE_KEYS = {
    title: 'TitleScene',
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

const CLASSIC_WAVE_LIMIT = 15;
const HUMAN_RESCUE_SCORE = 150;
const HUMAN_DROP_OFF_SCORE_MULTIPLIER = 2;
const COMBO_CONFIG = {
    maxStacks: 30,
    decayMs: 4500,
    stepSize: 5,
    stepBonus: 0.1,
    maxBonus: 0.5
};

const POWERUP_DECAY_CONFIG = {
    assaultMultiplier: 0.75,
    paths: {
        laser: { tiers: { 1: 35000, 2: 40000 } },
        multiShot: { tiers: { 1: 60000, 2: 45000, 3: 30000 } },
        coverage: { tiers: { 1: 60000, 2: 30000 } },
        missile: { tiers: { 1: 45000, 2: 30000, 3: 15000 } }
    }
};

const DEFAULT_KEY_BINDINGS = {
    moveLeft: 'LEFT',
    moveRight: 'RIGHT',
    moveUp: 'UP',
    moveDown: 'DOWN',
    fire: 'SPACE',
    transform: 'SHIFT',
    jump: 'CTRL',
    bomb: 'B',
    eject: 'E',
    enter: 'R',
    hyperspace: 'Q',
    pause: 'P',
    switchPrimary: 'TAB'
};

// Player-facing settings (audio + accessibility)
const SETTINGS_STORAGE_KEY = 'skyline_user_settings_v1';
const userSettings = {
    musicVolume: 0.6,
    sfxVolume: 0.7,
    reduceFlashes: false,
    muted: false,
    keyBindings: { ...DEFAULT_KEY_BINDINGS }
};

// Validates and normalizes persisted key bindings against supported Phaser keyboard key codes.
function sanitizeKeyBindings(bindings) {
    const sanitized = { ...DEFAULT_KEY_BINDINGS };
    if (!bindings || typeof bindings !== 'object') return sanitized;
    Object.keys(DEFAULT_KEY_BINDINGS).forEach((action) => {
        const value = bindings[action];
        if (typeof value === 'string') {
            const keyName = value.toUpperCase();
            if (Phaser?.Input?.Keyboard?.KeyCodes?.[keyName]) {
                sanitized[action] = keyName;
            }
        }
    });
    return sanitized;
}

// Loads persisted user settings from local storage and safely applies valid values.
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
            if (parsed.keyBindings) userSettings.keyBindings = sanitizeKeyBindings(parsed.keyBindings);
        }
    } catch (err) {
        // Ignore malformed storage
    }
}

// Persists the current user settings object to local storage.
function persistUserSettings() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings));
}

// Reports whether reduced-flash accessibility mode is enabled in user settings.
function isFlashReductionEnabled() {
    return !!userSettings.reduceFlashes;
}

// Computes power-up decay duration for a path/tier, including assault-mode duration scaling.
function getDecayDurationMs(path, tier) {
    if (!path || !tier || tier <= 0) return 0;
    const pathConfig = POWERUP_DECAY_CONFIG.paths?.[path];
    const baseDuration = pathConfig?.tiers?.[tier] || 0;
    if (!baseDuration) return 0;
    const multiplier = gameState.mode === 'assault' ? POWERUP_DECAY_CONFIG.assaultMultiplier : 1;
    return Math.round(baseDuration * multiplier);
}

loadUserSettings();

// Phase 2 interior objective configuration
const MOTHERSHIP_INTERIOR_CONFIG = {
    powerConduitCount: 4,
    securityNodeCount: 3,
    powerConduitHp: 12,
    securityNodeHp: 8,
    reinforcementInterval: 5000,
    reinforcementBatch: 2,
    coreChamberHp: 40,
    transitionDelayMs: 2500,
    oxygenDrainRate: 0, // future use
    interiorEnemyTypes: ['seeker', 'kamikaze', 'shield', 'bomber']
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
    mode: 'classic',
    timeRemaining: 0,
    timePlayedMs: 0,
    enemiesToKillThisWave: 0,
    killsThisWave: 0,
    nextExtraLife: 10000,
    bossActive: false,
    battleshipActive: false,
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
    clutchDefenseBonus: 0,
    comboStacks: 0,
    comboTimer: 0,
    comboMultiplier: 1,
    comboMaxStacks: 0,
    comboFlowActive: false,
    metaAppliedLoadout: null,
    metaAppliedDrop: null,
    metaRewardsGranted: false,
    assaultObjective: {
        active: false,
        baseHp: 0,
        baseHpMax: 0,
        phaseLabel: '',
        gateLabel: '',
        gateColor: '#ffffff',
        spawnTimer: 0,
        shieldsRemaining: 0,
        shieldHitCooldown: 0,
        turretFireTimer: 0,
        reinforcementTimer: 0,
        baseX: 0,
        baseVariant: null,
        shieldStage: 1,
        shieldStageTotal: 1,
        damageWindowUntil: 0,
        intermissionUntil: 0,
        interiorPhase: false,
        interiorStarted: false,
        powerConduitsRemaining: 0,
        powerConduitsTotal: 0,
        securityNodesRemaining: 0,
        securityNodesTotal: 0,
        coreChamberOpen: false,
        coreChamberHp: 0,
        coreChamberHpMax: 0,
        coreChamberActive: false,
        interiorReinforcementTimer: 0,
        shipLocked: false,
        transitionTimer: 0
    },
    mothershipObjective: {
        active: false,
        bossKey: null,
        bossHp: 0,
        bossHpMax: 0,
        reinforcementTimer: 0,
        phase: 0,
        shieldsRemaining: 0,
        phaseLabel: '',
        gateLabel: '',
        gateColor: '#ffffff',
        // Phase 2 interior fields
        interiorPhase: false,
        interiorStarted: false,
        powerConduitsRemaining: 0,
        powerConduitsTotal: 0,
        securityNodesRemaining: 0,
        securityNodesTotal: 0,
        coreChamberOpen: false,
        coreChamberHp: 0,
        coreChamberHpMax: 0,
        coreChamberActive: false,
        interiorReinforcementTimer: 0,
        shipLocked: true,
        transitionTimer: 0
    },
    rebuildObjective: {
        active: false,
        stage: null,
        timer: 0,
        encounterSpawned: false,
        extractionX: 0,
        extractionY: 0,
        branch: 'dropship',
        requiredAlienTech: 0,
        collectedAlienTech: 0,
        shipReturned: false,
        hangarRebuildTimer: 0
    }
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
        coverage: 0,
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
    primaryWeapon: 'laser',
    powerUpDecay: {
        laser: 0,
        multiShot: 0,
        coverage: 0,
        missile: 0
    },
    decayFlash: {
        laser: 0,
        multiShot: 0,
        coverage: 0,
        missile: 0
    },
    comradeBuffs: {
        level: 0
    },
    direction: 'right',
    baseSpeed: 300
};

// Aegis + pilot states
const aegisState = {
    mode: 'interceptor',
    active: true,
    facing: 1,
    aimAngle: 0,
    transformCooldown: 0,
    vx: 0,
    vy: 0,
    destroyed: false
};

const pilotState = {
    active: false,
    facing: 1,
    grounded: false,
    climbing: false,
    vx: 0,
    vy: 0
};

// Virtual input for touch controls
window.virtualInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false
};

// Reset game state function
// Resets run-time game, player, and objective state back to fresh-run defaults.
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
    gameState.timePlayedMs = 0;
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
        coverage: 0,
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
    playerState.primaryWeapon = 'laser';
    playerState.powerUpDecay = {
        laser: 0,
        multiShot: 0,
        coverage: 0,
        missile: 0
    };
    playerState.decayFlash = {
        laser: 0,
        multiShot: 0,
        coverage: 0,
        missile: 0
    };
    playerState.comradeBuffs = {
        level: 0
    };
    playerState.direction = 'right';
    aegisState.mode = 'interceptor';
    aegisState.active = true;
    aegisState.facing = 1;
    aegisState.aimAngle = 0;
    aegisState.transformCooldown = 0;
    aegisState.vx = 0;
    aegisState.vy = 0;
    aegisState.destroyed = false;
    pilotState.active = false;
    pilotState.facing = 1;
    pilotState.grounded = false;
    pilotState.climbing = false;
    pilotState.vx = 0;
    pilotState.vy = 0;

    gameState.bossActive = false;
    gameState.battleshipActive = false;
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
    gameState.clutchDefenseBonus = 0;
    gameState.comboStacks = 0;
    gameState.comboTimer = 0;
    gameState.comboMultiplier = 1;
    gameState.comboMaxStacks = 0;
    gameState.comboFlowActive = false;
    gameState.metaAppliedLoadout = null;
    gameState.metaAppliedDrop = null;
    gameState.metaRewardsGranted = false;
    gameState.assaultObjective = {
        active: false,
        baseHp: 0,
        baseHpMax: 0,
        phaseLabel: '',
        gateLabel: '',
        gateColor: '#ffffff',
        spawnTimer: 0,
        shieldsRemaining: 0,
        shieldHitCooldown: 0,
        turretFireTimer: 0,
        reinforcementTimer: 0,
        baseX: 0,
        baseVariant: null,
        shieldStage: 1,
        shieldStageTotal: 1,
        damageWindowUntil: 0,
        intermissionUntil: 0,
        interiorPhase: false,
        interiorStarted: false,
        powerConduitsRemaining: 0,
        powerConduitsTotal: 0,
        securityNodesRemaining: 0,
        securityNodesTotal: 0,
        coreChamberOpen: false,
        coreChamberHp: 0,
        coreChamberHpMax: 0,
        coreChamberActive: false,
        interiorReinforcementTimer: 0,
        shipLocked: false,
        transitionTimer: 0
    };
    gameState.mothershipObjective = {
        active: false,
        bossKey: null,
        bossHp: 0,
        bossHpMax: 0,
        reinforcementTimer: 0,
        phase: 0,
        shieldsRemaining: 0,
        phaseLabel: '',
        gateLabel: '',
        gateColor: '#ffffff',
        interiorPhase: false,
        interiorStarted: false,
        powerConduitsRemaining: 0,
        powerConduitsTotal: 0,
        securityNodesRemaining: 0,
        securityNodesTotal: 0,
        coreChamberOpen: false,
        coreChamberHp: 0,
        coreChamberHpMax: 0,
        coreChamberActive: false,
        interiorReinforcementTimer: 0,
        shipLocked: true,
        transitionTimer: 0
    };
    gameState.rebuildObjective = {
        active: false,
        stage: null,
        timer: 0,
        encounterSpawned: false,
        extractionX: 0,
        extractionY: 0,
        branch: 'dropship',
        requiredAlienTech: 0,
        collectedAlienTech: 0,
        shipReturned: false,
        hangarRebuildTimer: 0
    };

    if (window.ShipController?.resetCargo) {
        window.ShipController.resetCargo();
    }
}
