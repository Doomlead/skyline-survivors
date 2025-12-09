// ------------------------
// Enemy Configuration and Constants
// ------------------------

const ENEMY_TRAIL_CONFIGS = {
    default: {
        tint: [0xffffff],
        speed: 15,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 200,
        frequency: 80
    },
    mutant: {
        tint: [0xffbb66],
        speed: 30,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 60
    },
    drone: {
        tint: [0xff66ff],
        speed: 25,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 70
    },
    bomber: {
        tint: [0xff5533],
        speed: 20,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 60,
        gravityY: 30
    },
    pod: {
        tint: [0xaa00ff],
        speed: 25,
        scale: { start: 0.45, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 300,
        frequency: 65
    },
    swarmer: {
        tint: [0x66ff66],
        speed: 35,
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 180,
        frequency: 50
    },
    baiter: {
        tint: [0xff66ff],
        speed: 40,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 180,
        frequency: 40
    },
    kamikaze: {
        tint: [0xff0000],
        speed: 50,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 150,
        frequency: 30
    },
    turret: {
        tint: [0x666666],
        speed: 0,
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 100,
        frequency: 200
    },
    shield: {
        tint: [0x00ffff],
        speed: 20,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 300,
        frequency: 100
    },
    seeker: {
        tint: [0x8844ff],
        speed: 35,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 200,
        frequency: 50
    },
    spawner: {
        tint: [0xffff00],
        speed: 25,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 250,
        frequency: 70
    },
    shielder: {
        tint: [0x00ff00],
        speed: 20,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 300,
        frequency: 80
    },
    bouncer: {
        tint: [0xff6600],
        speed: 45,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 120,
        frequency: 25
    },
    sniper: {
        tint: [0x333333],
        speed: 10,
        scale: { start: 0.3, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 150,
        frequency: 150
    },
    swarmLeader: {
        tint: [0x6600ff],
        speed: 30,
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 280,
        frequency: 60
    },
    regenerator: {
        tint: [0x00aa44],
        speed: 15,
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.4, end: 0 },
        lifespan: 350,
        frequency: 90
    }
};

const ENEMY_HP_VALUES = {
    lander: 1,
    mutant: 2,
    drone: 1,
    bomber: 3,
    pod: 2,
    swarmer: 1,
    baiter: 2,
    kamikaze: 1,
    turret: 4,
    shield: 5,
    seeker: 2,
    spawner: 3,
    shielder: 3,
    bouncer: 2,
    sniper: 2,
    swarmLeader: 4,
    regenerator: 3
};

const ENEMY_SCORE_VALUES = {
    lander: 150,
    mutant: 200,
    drone: 100,
    bomber: 300,
    pod: 250,
    swarmer: 75,
    baiter: 180,
    kamikaze: 120,
    turret: 350,
    shield: 400,
    seeker: 220,
    spawner: 280,
    shielder: 320,
    bouncer: 160,
    sniper: 260,
    swarmLeader: 450,
    regenerator: 300
};

const ENEMY_SCALE_VALUES = {
    swarmer: 1.35,
    kamikaze: 1.8,
    bouncer: 1.8,
    turret: 2.2,
    sniper: 2.2,
    shield: 2.5,
    shielder: 2.5,
    spawner: 2.3,
    swarmLeader: 2.3,
    seeker: 2.0,
    regenerator: 2.0,
    default: 2.0
};

const ENEMY_TYPES = [
    'lander', 'mutant', 'drone', 'bomber', 'pod', 'baiter',
    'kamikaze', 'turret', 'shield', 'seeker', 'spawner',
    'shielder', 'bouncer', 'sniper', 'swarmLeader', 'regenerator'
];

// Export for testing environments while remaining safe for browser usage.
if (typeof module !== 'undefined') {
    module.exports = {
        ENEMY_TYPES,
        ENEMY_HP_VALUES,
        ENEMY_SCORE_VALUES
    };
}

function getEnemyHP(type) {
    return ENEMY_HP_VALUES[type] || 1;
}

function getEnemyScore(type) {
    return ENEMY_SCORE_VALUES[type] || 100;
}

function getEnemyScale(type) {
    return ENEMY_SCALE_VALUES[type] || ENEMY_SCALE_VALUES.default;
}
