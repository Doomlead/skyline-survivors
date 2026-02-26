// ------------------------
// file: js/interiors/sectionManager.js
// ------------------------
// Manages authored interior section loading, progression, and state

const INTERIOR_PATHS = {
  assault: [
    'js/interiors/sectionLayouts/assault/securityHub.json',
    'js/interiors/sectionLayouts/assault/powerGeneration.json',
    'js/interiors/sectionLayouts/assault/reactorCore.json'
  ],
  mothership: [
    'js/interiors/sectionLayouts/mothership/hangarBay.json',
    'js/interiors/sectionLayouts/mothership/bioLabs.json',
    'js/interiors/sectionLayouts/mothership/engineRoom.json',
    'js/interiors/sectionLayouts/mothership/shieldControl.json',
    'js/interiors/sectionLayouts/mothership/centralCore.json'
  ]
};

const INTERIOR_CACHE = {};

// Current runtime interior state
const interiorState = {
  missionType: null, // 'assault' | 'mothership'
  currentSectionIndex: 0,
  sections: [], // Loaded section data
  enemiesKilled: 0,
  enemiesSpawned: 0,
  activeEnemies: 0,
  bossDefeated: false,
  sectionCleared: false,
  gates: [], // Active gate entities
  hazards: [], // Active hazard entities
  reinforcements: {
    timer: 0,
    active: false
  }
};

// Load section data from JSON paths
async function loadInteriorSections(missionType) {
  const paths = INTERIOR_PATHS[missionType];
  if (!paths) {
    console.error(`Unknown interior mission type: ${missionType}`);
    return [];
  }

  const loaded = [];
  for (const path of paths) {
    if (INTERIOR_CACHE[path]) {
      loaded.push(INTERIOR_CACHE[path]);
      continue;
    }

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      const data = await response.json();
      INTERIOR_CACHE[path] = data;
      loaded.push(data);
    } catch (err) {
      console.error(`Failed to load interior section: ${path}`, err);
      // Fallback to empty section with defaults
      loaded.push(getFallbackSection());
    }
  }

  return loaded;
}

// Initialize interior mission synchronously with cached data
function initInteriorMission(scene, missionType) {
  // Use cached sections if available
  const paths = INTERIOR_PATHS[missionType];
  if (!paths) {
    console.error(`Unknown interior mission type: ${missionType}`);
    return false;
  }

  // Build sections from cache or use fallback
  const sections = paths.map(path => INTERIOR_CACHE[path] || getFallbackSection());

  interiorState.missionType = missionType;
  interiorState.currentSectionIndex = 0;
  interiorState.sections = sections;
  interiorState.enemiesKilled = 0;
  interiorState.enemiesSpawned = 0;
  interiorState.activeEnemies = 0;
  interiorState.bossDefeated = false;
  interiorState.sectionCleared = false;
  interiorState.gates = [];
  interiorState.hazards = [];
  interiorState.reinforcements = { timer: 0, active: false };

  if (interiorState.sections.length === 0) {
    console.error('No interior sections loaded');
    return false;
  }

  return loadSection(scene, 0);
}

// Preload sections for a mission type
async function preloadInteriorSections(missionType) {
  const paths = INTERIOR_PATHS[missionType];
  if (!paths) return;

  for (const path of paths) {
    if (INTERIOR_CACHE[path]) continue;
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        INTERIOR_CACHE[path] = data;
      }
    } catch (err) {
      console.warn('Failed to preload section:', path, err);
    }
  }
}

// Load specific section by index
function loadSection(scene, sectionIndex) {
  const section = interiorState.sections[sectionIndex];
  if (!section) {
    console.error(`Section index ${sectionIndex} not found`);
    return false;
  }

  interiorState.currentSectionIndex = sectionIndex;
  interiorState.sectionCleared = false;
  interiorState.enemiesKilled = 0;
  interiorState.enemiesSpawned = 0;
  interiorState.activeEnemies = 0;
  interiorState.bossDefeated = sectionIndex === interiorState.sections.length - 1 ? false : true;

  // Clear old hazards (support both direct global bindings and window-attached exports)
  const clearHazards = typeof clearInteriorHazards === 'function'
    ? clearInteriorHazards
    : (typeof window !== 'undefined' && typeof window.clearInteriorHazards === 'function'
      ? window.clearInteriorHazards
      : null);
  if (clearHazards) {
    clearHazards(scene);
  }

  // Build platforms using authored layout
  buildInteriorPlatformsFromLayout(scene, section);

  // Spawn initial enemies (support both direct global bindings and window-attached exports)
  const spawnEnemies = typeof spawnSectionEnemies === 'function'
    ? spawnSectionEnemies
    : (typeof window !== 'undefined' && typeof window.spawnSectionEnemies === 'function'
      ? window.spawnSectionEnemies
      : null);
  if (spawnEnemies) {
    spawnEnemies(scene, section);
  }

  // Initialize hazards
  const initHazards = typeof initializeHazards === 'function'
    ? initializeHazards
    : (typeof window !== 'undefined' && typeof window.initializeHazards === 'function'
      ? window.initializeHazards
      : null);
  if (initHazards) {
    initHazards(scene, section.hazards || []);
  }

  // Create section gate
  createSectionGate(scene, section.gate);

  // Setup reinforcements
  setupReinforcements(section.reinforcements);

  // Position player at spawn
  if (section.spawnPoints?.player) {
    const spawn = section.spawnPoints.player;
    if (scene.pilot) {
      scene.pilot.setPosition(spawn.x, spawn.y);
    }
  }

  // Update UI
  updateInteriorUI(section);

  return true;
}

// Progress to next section
function advanceToNextSection(scene) {
  const nextIndex = interiorState.currentSectionIndex + 1;
  if (nextIndex >= interiorState.sections.length) {
    // Mission complete
    completeInteriorMission(scene);
    return false;
  }

  return loadSection(scene, nextIndex);
}

// Check section completion conditions
function checkSectionProgress(scene) {
  const section = interiorState.sections[interiorState.currentSectionIndex];
  if (!section) return;

  if (interiorState.sectionCleared) return;

  // Check gate condition
  const gateCondition = section.gate?.condition || 'enemiesCleared';

  switch (gateCondition) {
    case 'enemiesCleared':
      if (interiorState.activeEnemies <= 0 && interiorState.enemiesKilled > 0) {
        openSectionGate(scene);
      }
      break;
    case 'bossDefeated':
      if (interiorState.bossDefeated) {
        openSectionGate(scene);
      }
      break;
    case 'time':
      // Time-based gates handled in update
      break;
    case 'key':
      // Key-based gates handled on key collection
      break;
  }
}

// Gate management
function createSectionGate(scene, gateConfig) {
  if (!gateConfig) return;

  // Clear existing gates
  interiorState.gates.forEach(g => {
    if (g.sprite) g.sprite.destroy();
    if (g.collider) g.collider.destroy();
  });
  interiorState.gates = [];

  const gate = scene.add.rectangle(
    gateConfig.x,
    gateConfig.y,
    gateConfig.width,
    gateConfig.height,
    0x444444
  );
  gate.setDepth(FG_DEPTH_BASE + 1);

  scene.physics.add.existing(gate, true);

  // Gate collision (blocks player until opened)
  const collider = scene.physics.add.collider(scene.pilot, gate);

  // Visual indicator
  const label = scene.add.text(gateConfig.x, gateConfig.y - 20, 'LOCKED', {
    fontFamily: 'Orbitron',
    fontSize: '10px',
    color: '#ff4444'
  }).setOrigin(0.5).setDepth(FG_DEPTH_BASE + 2);

  interiorState.gates.push({
    sprite: gate,
    collider: collider,
    label: label,
    config: gateConfig,
    open: false
  });

  return gate;
}

function openSectionGate(scene) {
  interiorState.gates.forEach(gate => {
    if (gate.open) return;
    gate.open = true;

    // Visual transition
    scene.tweens.add({
      targets: gate.sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        gate.sprite.destroy();
        gate.collider.destroy();
        gate.label.destroy();
      }
    });

    gate.label.setText('OPEN');
    gate.label.setColor('#44ff44');
  });

  interiorState.sectionCleared = true;
}

// Reinforcement spawning
function setupReinforcements(config) {
  if (!config) {
    interiorState.reinforcements.active = false;
    return;
  }

  interiorState.reinforcements = {
    timer: config.intervalMs || 8000,
    interval: config.intervalMs || 8000,
    maxActive: config.maxActive || 6,
    spawnPool: config.spawnPool || ['baseTrooper'],
    active: true
  };
}

function updateReinforcements(scene, time, delta) {
  if (!interiorState.reinforcements.active) return;

  interiorState.reinforcements.timer -= delta;

  if (interiorState.reinforcements.timer <= 0) {
    // Check max active
    if (interiorState.activeEnemies < interiorState.reinforcements.maxActive) {
      spawnReinforcement(scene);
    }
    interiorState.reinforcements.timer = interiorState.reinforcements.interval;
  }
}

function spawnReinforcement(scene) {
  const pool = interiorState.reinforcements.spawnPool;
  const enemyType = pool[Math.floor(Math.random() * pool.length)];

  // Spawn at edges of current section
  const section = interiorState.sections[interiorState.currentSectionIndex];
  const spawnX = Math.random() < 0.5 ? 50 : section.dimensions.width - 50;
  const spawnY = section.dimensions.groundY - 40;

  spawnInteriorEnemy(scene, enemyType, spawnX, spawnY);
}

// Enemy tracking
function registerEnemySpawn() {
  interiorState.activeEnemies++;
  interiorState.enemiesSpawned++;
}

function registerEnemyDeath(isBoss) {
  interiorState.activeEnemies = Math.max(0, interiorState.activeEnemies - 1);
  interiorState.enemiesKilled++;

  if (isBoss) {
    interiorState.bossDefeated = true;
  }
}

// Get current section data
function getCurrentSection() {
  return interiorState.sections[interiorState.currentSectionIndex];
}

// Mission completion
function completeInteriorMission(scene) {
  // Handle based on mission type
  if (interiorState.missionType === 'assault') {
    completeAssaultMission(scene);
  } else if (interiorState.missionType === 'mothership') {
    completeMothershipMission(scene);
  }
}

// Fallback section if JSON fails
function getFallbackSection() {
  return {
    sectionId: 'fallback',
    sectionName: 'Fallback',
    sectionIndex: 0,
    dimensions: { width: 1200, height: 600, groundY: 520 },
    platforms: [
      { x: 0, y: 520, width: 1200, height: 40, type: 'ground' },
      { x: 300, y: 400, width: 200, height: 16, type: 'standard' },
      { x: 700, y: 350, width: 200, height: 16, type: 'standard' }
    ],
    ladders: [
      { x: 310, y: 400, height: 120, connectsTo: [400, 400] },
      { x: 710, y: 350, height: 170, connectsTo: [800, 350] }
    ],
    spawnPoints: {
      player: { x: 50, y: 480 },
      enemies: [{ x: 900, y: 480, type: 'baseTrooper' }]
    },
    hazards: [],
    reinforcements: {
      intervalMs: 10000,
      maxActive: 4,
      spawnPool: ['baseTrooper']
    },
    gate: {
      x: 1180,
      y: 400,
      width: 20,
      height: 120,
      condition: 'enemiesCleared'
    }
  };
}

// Per-frame update
function updateInteriorManager(scene, time, delta) {
  // Update reinforcements
  updateReinforcements(scene, time, delta);

  // Update hazards
  updateInteriorHazards(scene, time, delta);

  // Check section progress
  checkSectionProgress(scene);

  // Check player position for section advancement
  const section = getCurrentSection();
  if (section && interiorState.sectionCleared) {
    const gateX = section.gate?.x ?? section.dimensions.width - 40;
    const playerX = scene.pilot?.x ?? 0;

    if (playerX >= gateX) {
      advanceToNextSection(scene);
    }
  }
}

// Export
window.interiorState = interiorState;
window.initInteriorMission = initInteriorMission;
window.preloadInteriorSections = preloadInteriorSections;
window.loadSection = loadSection;
window.advanceToNextSection = advanceToNextSection;
window.updateInteriorManager = updateInteriorManager;
window.registerEnemySpawn = registerEnemySpawn;
window.registerEnemyDeath = registerEnemyDeath;
window.getCurrentSection = getCurrentSection;
window.createSectionGate = createSectionGate;
window.openSectionGate = openSectionGate;
window.setupReinforcements = setupReinforcements;

if (typeof module !== 'undefined') {
  module.exports = {
    initInteriorMission,
    loadSection,
    advanceToNextSection,
    updateInteriorManager,
    interiorState,
    registerEnemySpawn,
    registerEnemyDeath,
    getCurrentSection
  };
}
