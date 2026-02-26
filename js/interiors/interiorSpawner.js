// ------------------------
// file: js/interiors/interiorSpawner.js
// ------------------------
// Interior enemy spawning from authored section layouts

const INTERIOR_SPAWN_GROUPS = {
  enemies: null,
  boss: null
};

function initInteriorSpawners(scene) {
  // Create dedicated groups for interior enemies
  if (!INTERIOR_SPAWN_GROUPS.enemies) {
    INTERIOR_SPAWN_GROUPS.enemies = scene.physics.add.group();
  } else {
    INTERIOR_SPAWN_GROUPS.enemies.clear(true, true);
  }

  if (!INTERIOR_SPAWN_GROUPS.boss) {
    INTERIOR_SPAWN_GROUPS.boss = scene.physics.add.group();
  } else {
    INTERIOR_SPAWN_GROUPS.boss.clear(true, true);
  }

  // Setup collisions
  if (scene.pilot) {
    scene.physics.add.overlap(
      scene.pilot,
      INTERIOR_SPAWN_GROUPS.enemies,
      handleInteriorEnemyCollision,
      null,
      scene
    );

    scene.physics.add.overlap(
      scene.pilot,
      INTERIOR_SPAWN_GROUPS.boss,
      handleInteriorEnemyCollision,
      null,
      scene
    );
  }

  // Projectile collision
  if (scene.projectiles) {
    scene.physics.add.overlap(
      scene.projectiles,
      INTERIOR_SPAWN_GROUPS.enemies,
      handleInteriorProjectileHit,
      null,
      scene
    );

    scene.physics.add.overlap(
      scene.projectiles,
      INTERIOR_SPAWN_GROUPS.boss,
      handleInteriorProjectileHit,
      null,
      scene
    );
  }
}

function spawnSectionEnemies(scene, section) {
  const spawns = section.spawnPoints?.enemies || [];
  const bossSpawn = section.spawnPoints?.boss;

  // Clear existing
  INTERIOR_SPAWN_GROUPS.enemies.clear(true, true);
  INTERIOR_SPAWN_GROUPS.boss.clear(true, true);

  // Spawn regular enemies
  spawns.forEach(spawn => {
    spawnInteriorEnemy(scene, spawn.type, spawn.x, spawn.y, spawn);
  });

  // Spawn boss if present
  if (bossSpawn) {
    spawnInteriorBoss(scene, bossSpawn.type, bossSpawn.x, bossSpawn.y, bossSpawn);
  }
}

function spawnInteriorEnemy(scene, type, x, y, overrides = {}) {
  const config = getEnemyConfig(type);
  if (!config) {
    console.warn('Unknown interior enemy type:', type);
    return null;
  }

  const enemy = INTERIOR_SPAWN_GROUPS.enemies.create(x, y, 'enemy');
  if (!enemy) return null;

  // Base setup
  enemy.enemyType = type;
  enemy.hp = overrides.hp || config.hp;
  enemy.maxHP = enemy.hp;
  enemy.score = config.score;
  enemy.lastShot = 0;
  enemy.isInteriorEnemy = true;

  // Physics
  if (enemy.body) {
    enemy.body.setImmovable(false);
    enemy.setCollideWorldBounds(false);
  }

  // Visual
  enemy.setTint(config.color);
  enemy.setScale(overrides.scale || config.scale);
  if (overrides.flipX) enemy.setFlipX(true);

  // Behavior-specific setup
  setupEnemyBehavior(scene, enemy, config, overrides);

  // Track
  if (typeof registerEnemySpawn === 'function') {
    registerEnemySpawn();
  }

  return enemy;
}

function spawnInteriorBoss(scene, type, x, y, overrides = {}) {
  const config = getEnemyConfig(type);
  if (!config) return null;

  const boss = INTERIOR_SPAWN_GROUPS.boss.create(x, y, 'boss');
  if (!boss) return null;

  boss.enemyType = type;
  boss.bossType = type;
  boss.hp = config.hp;
  boss.maxHP = boss.hp;
  boss.shield = config.shield || 0;
  boss.maxShield = boss.shield;
  boss.score = config.score;
  boss.isBoss = true;
  boss.isInteriorEnemy = true;

  if (boss.body) {
    boss.body.setImmovable(true);
  }

  boss.setTint(config.color);
  boss.setScale(config.scale);

  // Boss-specific behavior
  setupBossBehavior(scene, boss, config);

  // HUD
  gameState.currentBossName = config.name;

  return boss;
}

function setupEnemyBehavior(scene, enemy, config, overrides) {
  switch (config.behavior) {
    case 'patrol':
      enemy.patrolDirection = 1;
      enemy.patrolRange = overrides.patrolRange || 150;
      enemy.startX = enemy.x;
      break;

    case 'turret':
      if (enemy.body) enemy.body.setImmovable(true);
      enemy.blocksProgress = config.blocksProgress || false;
      enemy.burstCount = 0;
      enemy.burstTimer = 0;
      break;

    case 'hoverDrop':
      enemy.hoverY = enemy.y;
      enemy.dropTimer = config.dropInterval;
      break;

    case 'walker':
      enemy.weakSpotActive = true;
      enemy.saboteurDisabled = false;
      break;

    case 'rusher':
      enemy.charging = false;
      enemy.chargeTimer = 0;
      break;

    case 'swarm':
      enemy.packId = Math.floor(enemy.x / 200); // Group by spawn region
      break;

    case 'spawner':
      enemy.spawnTimer = config.spawnInterval;
      break;

    case 'support':
      enemy.healTarget = null;
      enemy.lastHeal = 0;
      break;

    case 'console':
      if (enemy.body) enemy.body.setImmovable(true);
      enemy.linkedBarriers = overrides.linkedBarriers || [];
      break;

    case 'proximityMine':
      if (enemy.body) enemy.body.setImmovable(true);
      enemy.armed = true;
      break;

    case 'aggressive':
      enemy.aggression = 1;
      break;
  }
}

function setupBossBehavior(scene, boss, config) {
  boss.currentPhase = 0;
  boss.phaseThresholds = config.phases.map(p => p.hpThreshold);
  boss.attackPatterns = config.attacks || [];
  boss.currentAttack = 0;
  boss.minions = [];

  if (config.corePulseInterval) {
    boss.nextCorePulse = scene.time.now + config.corePulseInterval;
  }
}

function spawnReinforcement(scene, type, x, y) {
  return spawnInteriorEnemy(scene, type, x, y);
}

function spawnSplitEnemy(scene, type, x, y) {
  // For mutant spawnlings on death
  const enemy = spawnInteriorEnemy(scene, type, x, y);
  if (enemy) {
    // Add small random velocity
    enemy.setVelocity(
      (Math.random() - 0.5) * 100,
      -50 - Math.random() * 50
    );
  }
  return enemy;
}

// Collision handlers
function handleInteriorEnemyCollision(player, enemy) {
  if (!enemy.active) return;

  // EMP effect from shock drones
  if (enemy.enemyType === 'shockDrone' && enemy.active) {
    applyEmpEffect(this, player);
    enemy.destroy();
    return;
  }

  // Electrocution from shockers
  if (enemy.enemyType === 'electroShocker' && enemy.charging) {
    triggerShockwave(this, enemy);
    return;
  }

  // Proximity mine detonation
  if (enemy.enemyType === 'hoverMine' && enemy.armed) {
    detonateMine(this, enemy);
    return;
  }

  // Regular contact damage
  if (playerState.powerUps.invincibility <= 0) {
    takePlayerDamage(this, 1);
  }
}

function handleInteriorProjectileHit(projectile, enemy) {
  if (!enemy.active || !projectile.active) return;

  const config = getEnemyConfig(enemy.enemyType);
  if (!config) return;

  // Check weak spot for heavy mech
  let damage = projectile.damage || 1;
  if (enemy.enemyType === 'heavyMech' && enemy.weakSpotActive) {
    const rear = enemy.flipX ? enemy.x + 15 : enemy.x - 15;
    const dx = Math.abs(projectile.x - rear);
    const dy = Math.abs(projectile.y - (enemy.y + 10));
    if (dx < 12 && dy < 15) {
      damage *= config.weakSpotMultiplier || 2;
    }
  }

  enemy.hp -= damage;

  // Reactive shield for mothership grunts
  if (config.reactiveShield && enemy.hp < config.hp && !enemy.shieldActive) {
    enemy.shieldActive = true;
    enemy.shieldHealth = config.shieldHealth;
    // Visual
    const shield = this.add.circle(enemy.x, enemy.y, enemy.width * 0.7, 0x00aaff, 0.3);
    this.time.delayedCall(3000, () => {
      if (shield.active) shield.destroy();
      enemy.shieldActive = false;
    });
  }

  // Check death
  if (enemy.hp <= 0) {
    handleInteriorEnemyDeath(this, enemy, config);
  }

  // Destroy projectile if not piercing
  if (!projectile.piercing) {
    projectile.destroy();
  }
}

function handleInteriorEnemyDeath(scene, enemy, config) {
  // Split on death
  if (config.splitOnDeath && config.splitType) {
    for (let i = 0; i < config.splitOnDeath; i++) {
      const angle = (Math.PI * 2 / config.splitOnDeath) * i;
      const dist = 20;
      const sx = enemy.x + Math.cos(angle) * dist;
      const sy = enemy.y + Math.sin(angle) * dist;
      spawnSplitEnemy(scene, config.splitType, sx, sy);
    }
  }

  // Loot drop
  if (config.drops) {
    const drop = rollDropTable(config.drops);
    if (drop && drop !== 'nothing') {
      spawnInteriorDrop(scene, enemy.x, enemy.y, drop, enemy);
    }
  }

  // Death effect
  createExplosion(scene, enemy.x, enemy.y, config.color || 0xff4444);

  // Track
  if (typeof registerEnemyDeath === 'function') {
    registerEnemyDeath(enemy.isBoss);
  }

  // Destroy
  enemy.destroy();
}

function spawnInteriorDrop(scene, x, y, dropType, sourceEnemy) {
  switch (dropType) {
    case 'key':
      // Find nearest locked door
      const door = ACTIVE_HAZARDS.find(h => h.type === 'lockedDoor' && !h.unlocked);
      if (door) {
        spawnKeyPickup(scene, x, y, door.id);
      }
      break;
    case 'ammo':
      spawnAmmoPickup(scene, x, y);
      break;
    case 'health':
      spawnHealthPickup(scene, x, y);
      break;
  }
}

function spawnKeyPickup(scene, x, y, doorId) {
  const key = scene.physics.add.sprite(x, y, 'key');
  key.setTint(0xffaa00);
  key.keyTarget = doorId;

  scene.physics.add.overlap(scene.pilot, key, () => {
    unlockDoor(doorId);
    key.destroy();
  });
}

function spawnAmmoPickup(scene, x, y) {
  const ammo = scene.physics.add.sprite(x, y, 'ammo');
  ammo.setTint(0xaaaaaa);

  scene.physics.add.overlap(scene.pilot, ammo, () => {
    // Replenish current weapon ammo
    if (pilotState.weaponState && pilotState.weaponState.ammo) {
      const weapon = pilotState.weaponState.selected;
      const max = pilotState.weaponState.maxAmmo?.[weapon] || 200;
      pilotState.weaponState.ammo[weapon] = Math.min(
        max,
        pilotState.weaponState.ammo[weapon] + Math.floor(max * 0.3)
      );
    }
    ammo.destroy();
  });
}

function spawnHealthPickup(scene, x, y) {
  const health = scene.physics.add.sprite(x, y, 'health');
  health.setTint(0x00ff00);

  scene.physics.add.overlap(scene.pilot, health, () => {
    gameState.lives = Math.min(gameState.lives + 1, 5);
    health.destroy();
  });
}

// Special behaviors
function applyEmpEffect(scene, player) {
  // Disable weapons for 3 seconds
  pilotState.empDisabled = true;

  // Visual
  const empIcon = scene.add.text(player.x, player.y - 30, '⚡ EMP', {
    fontSize: '12px', color: '#ffaa00'
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: empIcon, alpha: 0, y: empIcon.y - 20, duration: 500
  });

  scene.time.delayedCall(3000, () => {
    pilotState.empDisabled = false;
    empIcon.destroy();
  });
}

function triggerShockwave(scene, enemy) {
  const config = getEnemyConfig('electroShocker');
  if (!config) return;

  // Shockwave visual
  const wave = scene.add.circle(enemy.x, enemy.y, 10, 0xaa00ff, 0.5);
  scene.tweens.add({
    targets: wave,
    scale: config.shockwaveRadius / 10,
    alpha: 0,
    duration: 400,
    onComplete: () => wave.destroy()
  });

  // Damage check
  const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.pilot.x, scene.pilot.y);
  if (dist <= config.shockwaveRadius) {
    if (playerState.powerUps.invincibility <= 0) {
      takePlayerDamage(scene, config.shockwaveDamage);
    }
  }

  enemy.charging = false;
}

function detonateMine(scene, mine) {
  const config = getEnemyConfig('hoverMine');

  // Explosion visual
  createExplosion(scene, mine.x, mine.y, 0xff4400, 2);

  // Damage radius
  const dist = Phaser.Math.Distance.Between(mine.x, mine.y, scene.pilot.x, scene.pilot.y);
  if (dist <= config.detonationRadius) {
    if (playerState.powerUps.invincibility <= 0) {
      takePlayerDamage(scene, config.detonationDamage);
    }
  }

  mine.destroy();
}

// Per-frame update for all interior enemies
function updateInteriorEnemies(scene, time, delta) {
  if (!INTERIOR_SPAWN_GROUPS.enemies) return;

  const player = scene.pilot;
  if (!player || !player.active) return;

  INTERIOR_SPAWN_GROUPS.enemies.children.entries.forEach(enemy => {
    if (!enemy.active) return;

    const config = getEnemyConfig(enemy.enemyType);
    if (!config) return;

    updateEnemyBehavior(scene, enemy, config, player, time, delta);
  });

  // Update boss
  INTERIOR_SPAWN_GROUPS.boss.children.entries.forEach(boss => {
    if (!boss.active) return;
    updateBossBehavior(scene, boss, time, delta);
  });
}

function updateEnemyBehavior(scene, enemy, config, player, time, delta) {
  const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);

  switch (config.behavior) {
    case 'patrol':
      updatePatrolBehavior(enemy, config, time);
      break;

    case 'turret':
      updateTurretBehavior(scene, enemy, config, player, time, distToPlayer);
      break;

    case 'hoverDrop':
      updateHoverDropBehavior(scene, enemy, config, player, time, delta);
      break;

    case 'walker':
      updateWalkerBehavior(scene, enemy, config, player, time, delta, distToPlayer);
      break;

    case 'rusher':
      updateRusherBehavior(scene, enemy, config, player, time, delta, distToPlayer);
      break;

    case 'swarm':
      updateSwarmBehavior(enemy, config, player, delta);
      break;

    case 'spawner':
      updateSpawnerBehavior(scene, enemy, config, time, delta);
      break;

    case 'support':
      updateSupportBehavior(scene, enemy, config, time, delta);
      break;

    case 'console':
      updateConsoleBehavior(scene, enemy, config, player, time);
      break;

    case 'proximityMine':
      updateMineBehavior(scene, enemy, config, player, time, distToPlayer);
      break;

    case 'aggressive':
      updateAggressiveBehavior(scene, enemy, config, player, time, delta, distToPlayer);
      break;
  }

  // Universal: open fire if in range
  if (distToPlayer <= config.attackRange && time > enemy.lastShot + config.fireRate) {
    if (config.projectileType && config.projectileType !== 'none') {
      shootAtPlayer(scene, enemy);
      enemy.lastShot = time;
    }
  }
}

// Behavior implementations
function updatePatrolBehavior(enemy, config, time) {
  if (!enemy.patrolDirection) enemy.patrolDirection = 1;

  const moved = Math.abs(enemy.x - enemy.startX);
  if (moved > enemy.patrolRange) {
    enemy.patrolDirection *= -1;
  }

  enemy.setVelocityX(config.speed * enemy.patrolDirection);
}

function updateTurretBehavior(scene, enemy, config, player, time, distToPlayer) {
  if (enemy.saboteurDisabled) return;

  // Face player
  enemy.flipX = player.x < enemy.x;

  // Burst fire
  if (distToPlayer <= config.attackRange) {
    if (time > enemy.burstTimer && enemy.burstCount < config.burstCount) {
      shootAtPlayer(scene, enemy, config.burstCount > 1);
      enemy.burstCount++;

      if (enemy.burstCount >= config.burstCount) {
        enemy.burstTimer = time + config.burstDelay * config.burstCount;
        enemy.burstCount = 0;
      }
    }
  }
}

function updateHoverDropBehavior(scene, enemy, config, player, time, delta) {
  // Hover
  enemy.y = enemy.hoverY + Math.sin(time * 0.003) * 5;

  // Drop EMP
  enemy.dropTimer -= delta;
  if (enemy.dropTimer <= 0) {
    // Drop charge
    const charge = scene.physics.add.sprite(enemy.x, enemy.y + 15, 'empCharge');
    charge.setTint(0xffaa00);
    charge.setVelocityY(80);

    scene.physics.add.overlap(scene.pilot, charge, () => {
        if (pilotState.powerUps.invincibility <= 0) {
          applyEmpEffect(scene, scene.pilot);
        }
        charge.destroy();
      });
      scene.time.delayedCall(5000, () => {
        if (charge.active) charge.destroy();
      });
      enemy.dropTimer = config.dropInterval;
    }
  }

  // Walker behavior remains from previous code...
}

// Exports
window.INTERIOR_SPAWN_GROUPS = INTERIOR_SPAWN_GROUPS;
window.initInteriorSpawners = initInteriorSpawners;
window.spawnSectionEnemies = spawnSectionEnemies;
window.spawnInteriorEnemy = spawnInteriorEnemy;
window.spawnInteriorBoss = spawnInteriorBoss;
window.spawnReinforcement = spawnReinforcement;
window.updateInteriorEnemies = updateInteriorEnemies;

if (typeof module !== 'undefined') {
  module.exports = {
    initInteriorSpawners,
    spawnSectionEnemies,
    spawnInteriorEnemy,
    spawnInteriorBoss,
    spawnReinforcement,
    updateInteriorEnemies,
    INTERIOR_SPAWN_GROUPS
  };
}