// ------------------------
// File: js/config/bossConfig.js
// ------------------------

const BOSS_TRAIL_CONFIGS = {
    megaLander: {
        tint: [0xff4444],
        speed: 20,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 100
    },
    titanMutant: {
        tint: [0xffaa66],
        speed: 35,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 350,
        frequency: 90
    },
    hiveDrone: {
        tint: [0xff66ff],
        speed: 30,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 110
    },
    behemothBomber: {
        tint: [0xff5533],
        speed: 25,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 350,
        frequency: 80,
        gravityY: 20
    },
    colossalPod: {
        tint: [0xaa00ff],
        speed: 20,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 350,
        frequency: 100
    },
    leviathanBaiter: {
        tint: [0x00ffff],
        speed: 40,
        scale: { start: 0.65, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 280,
        frequency: 70
    },
    apexKamikaze: {
        tint: [0xff0000],
        speed: 50,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 200,
        frequency: 60
    },
    fortressTurret: {
        tint: [0x888888],
        speed: 0,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 150,
        frequency: 200
    },
    overlordShield: {
        tint: [0x00ffff],
        speed: 15,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 400,
        frequency: 120
    },
    mothershipCore: {
        tint: [0x7dd3fc, 0x38bdf8, 0x312e81],
        speed: 18,
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.55, end: 0 },
        lifespan: 420,
        frequency: 90
    }
};

const BOSS_HP_MULTIPLIER = 6;
const BOSS_DAMAGE_REDUCTION = 0.35;

const BOSS_HP_VALUES = {
    megaLander: 30,
    titanMutant: 38,
    hiveDrone: 28,
    behemothBomber: 45,
    colossalPod: 35,
    leviathanBaiter: 40,
    apexKamikaze: 22,
    fortressTurret: 50,
    overlordShield: 55,
    mothershipCore: 150
};

const BOSS_SCORE_VALUES = {
    megaLander: 500,
    titanMutant: 550,
    hiveDrone: 450,
    behemothBomber: 600,
    colossalPod: 550,
    leviathanBaiter: 575,
    apexKamikaze: 400,
    fortressTurret: 650,
    overlordShield: 750,
    mothershipCore: 2000
};

const BOSS_SCALE_VALUES = {
    megaLander: 3.5,
    titanMutant: 4.0,
    hiveDrone: 3.0,
    behemothBomber: 4.0,
    colossalPod: 3.5,
    leviathanBaiter: 3.8,
    apexKamikaze: 3.2,
    fortressTurret: 4.2,
    overlordShield: 4.5,
    mothershipCore: 2.4
};

// Attack patterns define the SEQUENCE of attacks a boss cycles through.
// Each pattern entry is one "move" in the boss's attack cycle.
// The boss performs the current pattern, waits the cooldown, then advances.
const BOSS_ATTACK_PATTERNS = {
    megaLander: {
        projectileType: 'enemyProjectile_lander',
        damage: 1.5,
        phases: [
            // Phase 0 (shield up): slow radial bursts
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 200, cooldownMs: 2200 },
                    { type: 'aimed', count: 2, spread: 0.3, speed: 260, cooldownMs: 1800 },
                ],
            },
            // Phase 1 (first shield broken): faster, more bullets
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 230, cooldownMs: 1800 },
                    { type: 'aimed', count: 3, spread: 0.25, speed: 300, cooldownMs: 1400 },
                    { type: 'spiral', count: 4, speed: 220, cooldownMs: 1600 },
                ],
            },
            // Phase 2 (second shield broken / exposed): aggressive
            {
                sequence: [
                    { type: 'radial', count: 10, speed: 260, cooldownMs: 1400 },
                    { type: 'aimed', count: 4, spread: 0.2, speed: 340, cooldownMs: 1000 },
                    { type: 'spiral', count: 6, speed: 250, cooldownMs: 1200 },
                ],
            },
        ],
    },
    titanMutant: {
        projectileType: 'enemyProjectile_mutant',
        damage: 1.8,
        phases: [
            {
                sequence: [
                    { type: 'spread', count: 3, spread: 0.5, speed: 250, cooldownMs: 2000 },
                    { type: 'aimed', count: 1, speed: 320, cooldownMs: 1600 },
                ],
            },
            {
                sequence: [
                    { type: 'spread', count: 5, spread: 0.6, speed: 280, cooldownMs: 1600 },
                    { type: 'aimed', count: 2, spread: 0.15, speed: 350, cooldownMs: 1200 },
                    { type: 'radial', count: 6, speed: 240, cooldownMs: 1800 },
                ],
            },
            {
                sequence: [
                    { type: 'spread', count: 7, spread: 0.7, speed: 300, cooldownMs: 1200 },
                    { type: 'aimed', count: 3, spread: 0.12, speed: 380, cooldownMs: 900 },
                    { type: 'radial', count: 8, speed: 260, cooldownMs: 1400 },
                ],
            },
        ],
    },
    hiveDrone: {
        projectileType: 'enemyProjectile_drone',
        damage: 1.2,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 200, cooldownMs: 2400 },
                    { type: 'aimed', count: 2, spread: 0.3, speed: 240, cooldownMs: 2000 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 230, cooldownMs: 1800 },
                    { type: 'spiral', count: 4, speed: 210, cooldownMs: 1600 },
                    { type: 'aimed', count: 3, spread: 0.25, speed: 280, cooldownMs: 1400 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 12, speed: 250, cooldownMs: 1400 },
                    { type: 'spiral', count: 6, speed: 240, cooldownMs: 1200 },
                    { type: 'aimed', count: 4, spread: 0.2, speed: 300, cooldownMs: 1000 },
                ],
            },
        ],
    },
    behemothBomber: {
        projectileType: 'enemyProjectile_bomber',
        damage: 2.0,
        phases: [
            {
                sequence: [
                    { type: 'bombDrop', count: 3, speed: 80, cooldownMs: 3000 },
                    { type: 'spread', count: 2, spread: 0.4, speed: 200, cooldownMs: 2200 },
                ],
            },
            {
                sequence: [
                    { type: 'bombDrop', count: 4, speed: 100, cooldownMs: 2400 },
                    { type: 'spread', count: 3, spread: 0.5, speed: 240, cooldownMs: 1800 },
                    { type: 'aimed', count: 2, speed: 280, cooldownMs: 1600 },
                ],
            },
            {
                sequence: [
                    { type: 'bombDrop', count: 5, speed: 120, cooldownMs: 2000 },
                    { type: 'spread', count: 4, spread: 0.6, speed: 260, cooldownMs: 1400 },
                    { type: 'aimed', count: 3, spread: 0.15, speed: 320, cooldownMs: 1200 },
                ],
            },
        ],
    },
    colossalPod: {
        projectileType: 'enemyProjectile_pod',
        damage: 1.5,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 4, speed: 180, cooldownMs: 2600 },
                    { type: 'aimed', count: 2, spread: 0.35, speed: 220, cooldownMs: 2200 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 210, cooldownMs: 2000 },
                    { type: 'spiral', count: 4, speed: 200, cooldownMs: 1800 },
                    { type: 'aimed', count: 3, spread: 0.3, speed: 260, cooldownMs: 1600 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 240, cooldownMs: 1600 },
                    { type: 'spiral', count: 6, speed: 230, cooldownMs: 1400 },
                    { type: 'aimed', count: 4, spread: 0.25, speed: 300, cooldownMs: 1200 },
                ],
            },
        ],
    },
    leviathanBaiter: {
        projectileType: 'enemyProjectile_baiter',
        damage: 1.4,
        phases: [
            {
                sequence: [
                    { type: 'aimed', count: 3, spread: 0.2, speed: 320, cooldownMs: 1800 },
                    { type: 'radial', count: 5, speed: 260, cooldownMs: 2200 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 4, spread: 0.18, speed: 360, cooldownMs: 1400 },
                    { type: 'radial', count: 7, speed: 280, cooldownMs: 1800 },
                    { type: 'spiral', count: 5, speed: 300, cooldownMs: 1600 },
                ],
            },
            {
                sequence: [
                    { type: 'aimed', count: 5, spread: 0.15, speed: 400, cooldownMs: 1000 },
                    { type: 'radial', count: 10, speed: 300, cooldownMs: 1400 },
                    { type: 'spiral', count: 8, speed: 320, cooldownMs: 1200 },
                ],
            },
        ],
    },
    apexKamikaze: {
        projectileType: 'enemyProjectile',
        damage: 2.2,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 4, speed: 240, cooldownMs: 2000 },
                    { type: 'aimed', count: 2, speed: 300, cooldownMs: 1800 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 270, cooldownMs: 1600 },
                    { type: 'aimed', count: 3, spread: 0.2, speed: 340, cooldownMs: 1200 },
                    { type: 'burst', count: 4, speed: 280, cooldownMs: 1400 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 300, cooldownMs: 1200 },
                    { type: 'aimed', count: 4, spread: 0.18, speed: 380, cooldownMs: 900 },
                    { type: 'burst', count: 6, speed: 320, cooldownMs: 1000 },
                ],
            },
        ],
    },
    fortressTurret: {
        projectileType: 'enemyProjectile',
        damage: 1.3,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 220, cooldownMs: 2400 },
                    { type: 'aimed', count: 2, spread: 0.3, speed: 260, cooldownMs: 2000 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 250, angleOffset: Math.PI / 8, cooldownMs: 1800 },
                    { type: 'radial', count: 8, speed: 250, cooldownMs: 1800 },
                    { type: 'aimed', count: 3, spread: 0.25, speed: 300, cooldownMs: 1400 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 12, speed: 280, cooldownMs: 1400 },
                    { type: 'radial', count: 12, speed: 280, angleOffset: Math.PI / 12, cooldownMs: 1400 },
                    { type: 'aimed', count: 4, spread: 0.2, speed: 340, cooldownMs: 1000 },
                    { type: 'spiral', count: 6, speed: 260, cooldownMs: 1200 },
                ],
            },
        ],
    },
    overlordShield: {
        projectileType: 'enemyProjectile',
        damage: 2.5,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 160, cooldownMs: 3000 },
                    { type: 'aimed', count: 1, speed: 200, cooldownMs: 2600 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 190, cooldownMs: 2400 },
                    { type: 'aimed', count: 2, spread: 0.2, speed: 240, cooldownMs: 2000 },
                    { type: 'spiral', count: 4, speed: 180, cooldownMs: 2200 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 10, speed: 220, cooldownMs: 1800 },
                    { type: 'aimed', count: 3, spread: 0.18, speed: 280, cooldownMs: 1400 },
                    { type: 'spiral', count: 6, speed: 210, cooldownMs: 1600 },
                ],
            },
        ],
    },
    mothershipCore: {
        projectileType: 'enemyProjectile',
        damage: 2.8,
        phases: [
            {
                sequence: [
                    { type: 'radial', count: 6, speed: 200, cooldownMs: 2800 },
                    { type: 'aimed', count: 2, spread: 0.3, speed: 240, cooldownMs: 2400 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 8, speed: 230, cooldownMs: 2200 },
                    { type: 'aimed', count: 3, spread: 0.25, speed: 280, cooldownMs: 1800 },
                    { type: 'spiral', count: 6, speed: 220, cooldownMs: 2000 },
                ],
            },
            {
                sequence: [
                    { type: 'radial', count: 10, speed: 260, cooldownMs: 1600 },
                    { type: 'aimed', count: 4, spread: 0.2, speed: 320, cooldownMs: 1200 },
                    { type: 'spiral', count: 8, speed: 250, cooldownMs: 1400 },
                    { type: 'radial', count: 12, speed: 240, angleOffset: Math.PI / 12, cooldownMs: 1600 },
                ],
            },
        ],
    },
};

// Legacy shot configs kept for battleships and any code that still references them
const BOSS_SHOT_CONFIGS = {
    megaLander: { sources: 4, projectileType: 'enemyProjectile_lander', speed: 250, damage: 1.5, interval: 1200, pattern: 'radial' },
    titanMutant: { sources: 3, projectileType: 'enemyProjectile_mutant', speed: 300, damage: 1.8, interval: 1400, pattern: 'spread' },
    hiveDrone: { sources: 6, projectileType: 'enemyProjectile_drone', speed: 280, damage: 1.2, interval: 1000, pattern: 'hexagonal' },
    behemothBomber: { sources: 5, projectileType: 'enemyProjectile_bomber', speed: 200, damage: 2.0, interval: 2000, pattern: 'mixed' },
    colossalPod: { sources: 4, projectileType: 'enemyProjectile_pod', speed: 220, damage: 1.5, interval: 1500, pattern: 'radial' },
    leviathanBaiter: { sources: 5, projectileType: 'enemyProjectile_baiter', speed: 380, damage: 1.4, interval: 900, pattern: 'sequential' },
    apexKamikaze: { sources: 4, projectileType: 'enemyProjectile', speed: 300, damage: 2.2, interval: 800, pattern: 'burst' },
    fortressTurret: { sources: 8, projectileType: 'enemyProjectile', speed: 250, damage: 1.3, interval: 1100, pattern: 'rotating' },
    overlordShield: { sources: 6, projectileType: 'enemyProjectile', speed: 200, damage: 2.5, interval: 1800, pattern: 'radial' },
    mothershipCore: { sources: 8, projectileType: 'enemyProjectile', speed: 240, damage: 2.8, interval: 1400, pattern: 'radial' },
};

const BOSS_TYPES = [
    'megaLander', 'titanMutant', 'hiveDrone', 'behemothBomber', 'colossalPod',
    'leviathanBaiter', 'apexKamikaze', 'fortressTurret', 'overlordShield',
    'mothershipCore'
];

// Returns scaled hit points for a boss type using base values and the global boss HP multiplier.
function getBossHP(type) {
    const baseHP = BOSS_HP_VALUES[type] || 20;
    return baseHP * BOSS_HP_MULTIPLIER;
}

// Returns the score reward granted for defeating the specified boss type.
function getBossScore(type) {
    return BOSS_SCORE_VALUES[type] || 500;
}

// Returns the visual scale factor used when spawning the specified boss type.
function getBossScale(type) {
    return BOSS_SCALE_VALUES[type] || 3.5;
}

// Returns the legacy projectile pattern config for compatibility with older boss firing logic.
function getBossShotConfig(type) {
    return BOSS_SHOT_CONFIGS[type] || BOSS_SHOT_CONFIGS.megaLander;
}

// Returns the phase-based attack sequence definition used by modern boss behavior.
function getBossAttackPattern(type) {
    return BOSS_ATTACK_PATTERNS[type] || BOSS_ATTACK_PATTERNS.megaLander;
}
