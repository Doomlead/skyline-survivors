// ------------------------
// file: js/interiors/interiorEnemyConfig.js
// ------------------------
// Interior-specific enemy definitions and stats

const INTERIOR_ENEMIES = {
  // Assault Base Enemies
  baseTrooper: {
    name: 'Base Trooper',
    hp: 3,
    speed: 80,
    score: 100,
    behavior: 'patrol',
    attackRange: 400,
    fireRate: 1500,
    projectileType: 'rifle',
    projectileDamage: 1,
    projectileSpeed: 250,
    color: 0x666666,
    scale: 1.0,
    vulnerableTo: ['scattergun'],
    drops: { ammo: 0.3, health: 0.1, nothing: 0.6 }
  },
  
  turretSentry: {
    name: 'Turret Sentry',
    hp: 8,
    speed: 0, // Stationary
    score: 200,
    behavior: 'turret',
    attackRange: 500,
    fireRate: 800,
    burstCount: 3,
    burstDelay: 100,
    projectileType: 'spread',
    projectileDamage: 1,
    projectileSpeed: 200,
    color: 0x884444,
    scale: 1.2,
    blocksProgress: true, // Must be destroyed to advance
    drops: { key: 0.25, ammo: 0.4, nothing: 0.35 }
  },
  
  shockDrone: {
    name: 'Shock Drone',
    hp: 2,
    speed: 120,
    score: 150,
    behavior: 'hoverDrop',
    attackRange: 200,
    dropInterval: 4000,
    empRadius: 80,
    empDuration: 3000, // Disables weapons
    color: 0xffaa00,
    scale: 0.8,
    drops: { ammo: 0.5, nothing: 0.5 }
  },
  
  heavyMech: {
    name: 'Heavy Mech',
    hp: 15,
    speed: 40,
    score: 400,
    behavior: 'walker',
    attackRange: 350,
    fireRate: 2000,
    projectileType: 'rocket',
    projectileDamage: 3,
    projectileSpeed: 180,
    weakSpot: { x: 0, y: 10, scale: 0.6 }, // Rear engine
    weakSpotMultiplier: 2.5,
    color: 0x444466,
    scale: 1.5,
    saboteurDisableable: true,
    drops: { ammo: 0.6, health: 0.3, key: 0.1 }
  },
  
  electroShocker: {
    name: 'Electro Shocker',
    hp: 5,
    speed: 100,
    score: 250,
    behavior: 'rusher',
    attackRange: 50,
    chargeTime: 800,
    shockwaveRadius: 120,
    shockwaveDamage: 2,
    color: 0xaa00ff,
    scale: 1.1,
    drops: { ammo: 0.4, nothing: 0.6 }
  },
  
  swarmBot: {
    name: 'Swarm Bot',
    hp: 1,
    speed: 180,
    score: 50,
    behavior: 'swarm',
    packSize: 8,
    separationDistance: 40,
    color: 0x444444,
    scale: 0.6,
    drops: { ammo: 0.2, nothing: 0.8 }
  },
  
  // Mothership Enemies
  mothershipGrunt: {
    name: 'Mothership Grunt',
    hp: 4,
    speed: 90,
    score: 125,
    behavior: 'patrol',
    attackRange: 350,
    fireRate: 1200,
    projectileType: 'sonic',
    projectileDamage: 1,
    projectileSpeed: 300,
    reactiveShield: true, // Raises shield when hurt
    shieldHealth: 2,
    color: 0x664466,
    scale: 1.0,
    drops: { ammo: 0.35, health: 0.15, nothing: 0.5 }
  },
  
  hoverMine: {
    name: 'Hover Mine',
    hp: 1,
    speed: 60,
    score: 75,
    behavior: 'proximityMine',
    detectionRadius: 100,
    detonationRadius: 60,
    detonationDamage: 3,
    color: 0xff4444,
    scale: 0.7,
    detonatable: true, // Can be shot to detonate early
    drops: { ammo: 0.1, nothing: 0.9 }
  },
  
  mutantTestSubject: {
    name: 'Mutant Test Subject',
    hp: 6,
    speed: 110,
    score: 180,
    behavior: 'aggressive',
    attackRange: 80,
    splitOnDeath: 3,
    splitType: 'mutantSpawnling',
    color: 0x44aa44,
    scale: 1.2,
    drops: { ammo: 0.4, health: 0.2, nothing: 0.4 }
  },
  
  bioTank: {
    name: 'Bio-Tank',
    hp: 20,
    speed: 0, // Stationary
    score: 350,
    behavior: 'spawner',
    spawnInterval: 20000,
    spawnType: 'mutantTestSubject',
    spawnCount: 2,
    color: 0x44ff44,
    scale: 1.8,
    drops: { health: 0.7, ammo: 0.3 }
  },
  
  repairBot: {
    name: 'Repair Bot',
    hp: 4,
    speed: 100,
    score: 200,
    behavior: 'support',
    repairRange: 150,
    healAmount: 3,
    healInterval: 3000,
    priorityTarget: 'lowestHP',
    color: 0x00aaff,
    scale: 0.9,
    highPriority: true, // Player should target these first
    drops: { ammo: 0.5, health: 0.5 }
  },
  
  shieldOperator: {
    name: 'Shield Operator',
    hp: 5,
    speed: 70,
    score: 225,
    behavior: 'console',
    linkedBarrierIds: [], // Filled at spawn
    color: 0x0088ff,
    scale: 1.1,
    drops: { key: 0.3, ammo: 0.4, nothing: 0.3 }
  },
  
  // Boss
  reactorGuardian: {
    name: 'Reactor Guardian',
    hp: 500,
    shield: 200,
    shieldRegen: 10,
    speed: 50,
    score: 5000,
    behavior: 'boss',
            phases: [
      { hpThreshold: 0.66, behavior: 'missileSpread', fireRate: 2000 },
      { hpThreshold: 0.33, behavior: 'enraged', fireRate: 1200 }
    ],
    attacks: ['missileSpread', 'shockwave', 'minionSpawn'],
    color: 0xff0044,
    scale: 2.5,
    isBoss: true
  },
  
  theOverseer: {
    name: 'The Overseer',
    hp: 800,
    speed: 60,
    score: 10000,
    behavior: 'boss',
    phases: [
      { hpThreshold: 0.75, behavior: 'missiles', fireRate: 1800 },
      { hpThreshold: 0.50, behavior: 'summon', fireRate: 2500, summonType: 'mothershipGrunt' },
      { hpThreshold: 0.25, behavior: 'charge', fireRate: 1000, speedBoost: 1.5 }
    ],
    corePulseInterval: 10000, // AoE every 10s
    corePulseDamage: 4,
    color: 0xaa00aa,
    scale: 3.0,
    isBoss: true
  },
  
  // Split spawns
  mutantSpawnling: {
    name: 'Mutant Spawnling',
    hp: 2,
    speed: 150,
    score: 25,
    behavior: 'aggressive',
    attackRange: 60,
    color: 0x66cc66,
    scale: 0.7,
    drops: { ammo: 0.15, nothing: 0.85 }
  }
};

// Enemy spawn pools by section type
const SECTION_ENEMY_POOLS = {
  assault: {
    securityHub: ['baseTrooper', 'turretSentry', 'baseTrooper', 'shockDrone'],
    powerGeneration: ['baseTrooper', 'swarmBot', 'electroShocker', 'heavyMech'],
    reactorCore: ['baseTrooper', 'swarmBot', 'electroShocker', 'heavyMech', 'reactorGuardian']
  },
  mothership: {
    hangarBay: ['mothershipGrunt', 'hoverMine', 'turretSentry'],
    bioLabs: ['mutantTestSubject', 'bioTank', 'mothershipGrunt'],
    engineRoom: ['repairBot', 'hoverMine', 'mothershipGrunt'],
    shieldControl: ['shieldOperator', 'mothershipGrunt', 'turretSentry'],
    centralCore: ['mothershipGrunt', 'theOverseer']
  }
};

function getEnemyConfig(type) {
  return INTERIOR_ENEMIES[type] || INTERIOR_ENEMIES.baseTrooper;
}

function getSectionEnemyPool(missionType, sectionId) {
  const pools = SECTION_ENEMY_POOLS[missionType];
  if (!pools) return ['baseTrooper'];
  
  // Extract section key from full ID
  const sectionKey = sectionId.split('_').pop();
  return pools[sectionKey] || ['baseTrooper'];
}

function rollDropTable(dropTable) {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [drop, chance] of Object.entries(dropTable)) {
    cumulative += chance;
    if (roll <= cumulative) return drop;
  }
  
  return 'nothing';
}

window.INTERIOR_ENEMIES = INTERIOR_ENEMIES;
window.getEnemyConfig = getEnemyConfig;
window.getSectionEnemyPool = getSectionEnemyPool;
window.rollDropTable = rollDropTable;

if (typeof module !== 'undefined') {
  module.exports = { INTERIOR_ENEMIES, getEnemyConfig, getSectionEnemyPool, rollDropTable };
}