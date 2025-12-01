// ------------------------
// Boss Configuration and Constants
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
    }
};

const BOSS_HP_VALUES = {
    megaLander: 25,
    titanMutant: 30,
    hiveDrone: 20,
    behemothBomber: 35,
    colossalPod: 28,
    leviathanBaiter: 32,
    apexKamikaze: 15,
    fortressTurret: 40,
    overlordShield: 45
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
    overlordShield: 750
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
    overlordShield: 4.5
};

const BOSS_SHOT_CONFIGS = {
    megaLander: {
        sources: 4,  // 4 tentacles
        projectileType: 'enemyProjectile_lander',
        speed: 250,
        damage: 1.5,
        interval: 1200,
        pattern: 'radial'  // Tentacles spread shots
    },
    titanMutant: {
        sources: 3,  // 3 arms
        projectileType: 'enemyProjectile_mutant',
        speed: 300,
        damage: 1.8,
        interval: 1400,
        pattern: 'spread'  // Arms fire at different angles
    },
    hiveDrone: {
        sources: 6,  // 6 gun ports
        projectileType: 'enemyProjectile_drone',
        speed: 280,
        damage: 1.2,
        interval: 1000,
        pattern: 'hexagonal'  // Hex pattern shooting
    },
    behemothBomber: {
        sources: 5,  // 3 bomb bays + 2 side guns
        projectileType: 'enemyProjectile_bomber',
        speed: 200,
        damage: 2.0,
        interval: 2000,
        pattern: 'mixed'  // Bombs down, bullets side
    },
    colossalPod: {
        sources: 4,  // 4 spawn ports
        projectileType: 'enemyProjectile_pod',
        speed: 220,
        damage: 1.5,
        interval: 1500,
        pattern: 'radial'
    },
    leviathanBaiter: {
        sources: 5,  // 5 thrusters
        projectileType: 'enemyProjectile_baiter',
        speed: 380,
        damage: 1.4,
        interval: 900,
        pattern: 'sequential'  // Sequential firing
    },
    apexKamikaze: {
        sources: 4,  // 4 explosive appendages
        projectileType: 'enemyProjectile',
        speed: 300,
        damage: 2.2,
        interval: 800,
        pattern: 'burst'  // Quick bursts
    },
    fortressTurret: {
        sources: 8,  // 8 barrels
        projectileType: 'enemyProjectile',
        speed: 250,
        damage: 1.3,
        interval: 1100,
        pattern: 'rotating'  // Rotating barrel pattern
    },
    overlordShield: {
        sources: 6,  // 6 energy nodes
        projectileType: 'enemyProjectile',
        speed: 200,
        damage: 2.5,  // Slow but powerful
        interval: 1800,
        pattern: 'radial'
    }
};

const BOSS_TYPES = [
    'megaLander', 'titanMutant', 'hiveDrone', 'behemothBomber', 'colossalPod',
    'leviathanBaiter', 'apexKamikaze', 'fortressTurret', 'overlordShield'
];

function getBossHP(type) {
    return BOSS_HP_VALUES[type] || 20;
}

function getBossScore(type) {
    return BOSS_SCORE_VALUES[type] || 500;
}

function getBossScale(type) {
    return BOSS_SCALE_VALUES[type] || 3.5;
}

function getBossShotConfig(type) {
    return BOSS_SHOT_CONFIGS[type] || BOSS_SHOT_CONFIGS.megaLander;
}