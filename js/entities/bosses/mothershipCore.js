// js\entities\bosses\mothershipCore.js
// Mothership Core Encounter and Behavior
// Includes Phase 1 (exterior boss) and Phase 2 (interior on-foot assault)
// 

// Initializes phase/state metadata unique to the mothership core boss encounter.
function initializeMothershipCore(boss) {
    if (!boss) return;
    boss.corePhase = 0;
    boss.lastPulse = 0;
    boss.anchorX = boss.anchorX ?? boss.x;
    boss.anchorY = boss.anchorY ?? boss.y;
    boss.setVelocity(0, 0);
    if (boss.body) {
        boss.body.setImmovable(true);
        boss.body.setAllowGravity(false);
    }
}

// Returns the world position used for mothership breach/transition cinematics.
function getMothershipBreachPosition(scene) {
    const worldWidth = CONFIG.worldWidth;
    const groundLevel = scene?.groundLevel ?? CONFIG.worldHeight - 80;
    const breachX = worldWidth * 0.68;
    const breachY = groundLevel - 55;
    return { x: breachX, y: breachY };
}

// Configures and starts the mothership exterior encounter and objective tracking.
function setupMothershipEncounter(scene) {
    if (!scene) return;
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.active = true;
    objective.bossKey = 'mothershipCore';
    objective.reinforcementTimer = 0;
    objective.phase = 0;
    objective.shieldsRemaining = 0;
    objective.damageWindowMs = 0;

    // Reset Phase 2 fields
    objective.interiorPhase = false;
    objective.interiorStarted = false;
    objective.powerConduitsRemaining = 0;
    objective.powerConduitsTotal = 0;
    objective.securityNodesRemaining = 0;
    objective.securityNodesTotal = 0;
    objective.coreChamberOpen = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = 0;
    objective.coreChamberActive = false;
    objective.interiorReinforcementTimer = 0;
    objective.shipLocked = false;
    objective.transitionTimer = 0;

    const breachPosition = getMothershipBreachPosition(scene);
    const spawnX = breachPosition.x;
    const spawnY = breachPosition.y;
    const boss = spawnBoss(scene, 'mothershipCore', spawnX, spawnY);
    if (boss) {
        gameState.bossActive = true;
        gameState.currentBossKey = 'mothershipCore';
        gameState.currentBossName = 'Mothership Core';
        boss.anchorX = spawnX;
        boss.anchorY = spawnY;
        boss.setVelocity(0, 0);
        if (boss.body) {
            boss.body.setImmovable(true);
            boss.body.setAllowGravity(false);
        }
        objective.bossHp = boss.hp;
        objective.bossHpMax = boss.maxHP;
        objective.shieldsRemaining = boss.phaseState?.shieldHp || 0;
    }

    showRebuildObjectiveBanner(scene, 'FINAL ASSAULT: DESTROY THE MOTHERSHIP CORE', '#38bdf8');
}

// Advances mothership objective state machine across exterior and interior phases.
function updateMothershipEncounter(scene, delta) {
    const objective = gameState.mothershipObjective;
    if (!objective?.active) return;

    // Phase 2 interior handling
    if (objective.interiorPhase) {
        updateMothershipInterior(scene, delta);
        return;
    }

    const boss = scene.bosses?.children?.entries?.find(entry => entry.active && entry.bossType === 'mothershipCore');
    if (!boss) {
        // Boss was destroyed but interiorPhase not yet set - transition is pending
        if (!objective.interiorPhase) {
            objective.active = false;
        }
        return;
    }

    objective.bossHp = boss.hp;
    objective.bossHpMax = boss.maxHP;
    objective.phase = typeof getEncounterPhase === 'function' ? getEncounterPhase(boss) : (boss.corePhase || 0);
    objective.shieldsRemaining = boss.phaseState?.shieldHp || 0;
    const hud = typeof getPhaseHudStatus === 'function' ? getPhaseHudStatus(boss, scene.time?.now || 0) : null;
    objective.phaseLabel = hud?.phaseText || `Phase ${(objective.phase || 0) + 1}`;
    objective.gateLabel = hud?.gateText || '';
    objective.gateColor = hud?.gateColor || '#ffffff';

    objective.reinforcementTimer += delta;
    const interval = objective.phase === 2 ? 2600 : objective.phase === 1 ? 3400 : 4200;
    if (objective.reinforcementTimer >= interval) {
        objective.reinforcementTimer = 0;
        const reinforcements = ['shield', 'spawner', 'seeker', 'kamikaze', 'bomber'];
        const type = Phaser.Utils.Array.GetRandom(reinforcements);
        const spawnX = scene.cameras.main.scrollX + Math.random() * CONFIG.width;
        const spawnY = CONFIG.height * 0.2 + Math.random() * CONFIG.height * 0.4;
        spawnEnemy(scene, type, spawnX, spawnY, false);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// PHASE 2 - INTERIOR ENCOUNTER
// ═══════════════════════════════════════════════════════════════════════

// Handles exterior core defeat flow and begins the interior transition sequence.
function handleMothershipCoreDefeat(scene) {
    const objective = gameState.mothershipObjective;
    if (!objective) {
        // Fallback if no objective state
        scene.time.delayedCall(1200, () => { winGame(scene); });
        return;
    }

    // Instead of winning, transition to Phase 2 interior
    objective.interiorPhase = true;
    objective.active = true;
    objective.transitionTimer = 0;
    objective.shipLocked = true;

    // Clear Phase 1 boss state
    gameState.bossActive = false;
    gameState.currentBossKey = null;
    gameState.currentBossName = '';

    // Score reward for Phase 1 completion
    const phaseReward = getMissionScaledReward(3000);
    gameState.score += phaseReward;

    showRebuildObjectiveBanner(scene, 'MOTHERSHIP HULL BREACHED - BOARDING IN PROGRESS', '#ff6b35');

    // Delay the interior setup to let the explosion settle
    scene.time.delayedCall(MOTHERSHIP_INTERIOR_CONFIG.transitionDelayMs, () => {
        beginMothershipInterior(scene);
    });
}

// Transitions gameplay into interior phase: clears exterior, swaps bg, and spawns objectives.
function beginMothershipInterior(scene) {
    const objective = gameState.mothershipObjective;
    if (!objective) return;

    objective.interiorStarted = true;

    // 1. Clear remaining exterior enemies and projectiles
    clearExteriorEntities(scene);

    // 2. Swap background to interior
    swapToInteriorBackground(scene);

    // 2.5. Build interior collision platforms/ladders while keeping groundLevel compatibility
    // Initialize mission first, then get section data
  initInteriorMission(scene, 'mothership');

  const section = interiorState.sections && interiorState.sections[0] ? interiorState.sections[0] : null;
  if (!section) {
    console.error('No mothership interior sections available');
    return;
  }

  if (typeof buildInteriorPlatformsFromLayout === 'function') {
    buildInteriorPlatformsFromLayout(scene, section);
  }
  if (typeof initializeHazards === 'function') {
    initializeHazards(scene, section.hazards || []);
  }
  if (typeof initInteriorSpawners === 'function') {
    initInteriorSpawners(scene);
    if (typeof spawnSectionEnemies === 'function') {
      spawnSectionEnemies(scene, section);
    }
  }

    // 3. Force pilot ejection - lock ship controls
    forceOnFoot(scene);

    // 4. Spawn interior objectives
    spawnInteriorObjectives(scene);

    // 5. Update HUD state
    objective.phaseLabel = 'PHASE 2 - INTERIOR';
    objective.gateLabel = 'Destroy power conduits & security nodes';
    objective.gateColor = '#ff00ff';

    showRebuildObjectiveBanner(scene, 'INTERIOR BREACH\nDestroy all power conduits and security nodes', '#ff00ff');
}

// Removes exterior enemies/projectiles/objects before entering mothership interior phase.
function clearExteriorEntities(scene) {
    // Destroy all active enemies
    if (scene.enemies) {
        scene.enemies.children.entries.slice().forEach(enemy => {
            if (enemy && enemy.active) {
                enemy.destroy();
            }
        });
    }

    // Clear enemy projectiles
    if (scene.enemyProjectiles) {
        scene.enemyProjectiles.children.entries.slice().forEach(proj => {
            if (proj && proj.active) proj.destroy();
        });
    }

    // Clear player projectiles
    if (scene.projectiles) {
        scene.projectiles.children.entries.slice().forEach(proj => {
            if (proj && proj.active) proj.destroy();
        });
    }

    // Clear assault targets from Phase 1
    if (scene.assaultTargets) {
        scene.assaultTargets.children.entries.slice().forEach(target => {
            if (target && target.active) target.destroy();
        });
    }

    // Clear garrison defenders
    if (scene.garrisonDefenders) {
        scene.garrisonDefenders.children.entries.slice().forEach(def => {
            if (def && def.active) def.destroy();
        });
    }

    // Clear remaining bosses
    if (scene.bosses) {
        scene.bosses.children.entries.slice().forEach(boss => {
            if (boss && boss.active) boss.destroy();
        });
    }

    // Clear battleships
    if (scene.battleships) {
        scene.battleships.children.entries.slice().forEach(bs => {
            if (bs && bs.active) bs.destroy();
        });
    }
}

// Rebuilds parallax/background layers for mothership interior presentation.
function swapToInteriorBackground(scene) {
    // Destroy existing parallax layers
    destroyParallax();

    // Recreate with interior style
    createBackground(scene, 'mothership_interior');

    // Re-initialize parallax tracking with current camera
    const mainCam = scene.cameras.main;
    if (mainCam) {
        initParallaxTracking(mainCam.scrollX, mainCam.scrollY);
    }

    console.log('[MothershipCore] Background swapped to mothership_interior');
}

// Forces player into pilot-only state and locks AEGIS for interior phase gameplay.
function forceOnFoot(scene) {
    const objective = gameState.mothershipObjective;

    // If player is in Aegis, force eject
    if (aegisState.active && scene.aegis) {
        ejectPilot(scene);
    }

    // Mark Aegis as destroyed/locked for Phase 2
    aegisState.active = false;
    aegisState.destroyed = true;
    objective.shipLocked = true;

    // Hide the Aegis sprite
    if (scene.aegis) {
        scene.aegis.setActive(false).setVisible(false);
        scene.aegis.body.enable = false;
    }

    // Ensure pilot is active and on the ground
    if (scene.pilot) {
        pilotState.active = true;
        scene.pilot.setActive(true).setVisible(true);
        scene.pilot.setAlpha(1);
        scene.pilot.clearTint();
        scene.pilot.body.enable = true;

        // Position pilot at left side of the interior
        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        scene.pilot.setPosition(200, groundLevel - 30);
        pilotState.grounded = false;
        pilotState.vx = 0;
        pilotState.vy = 0;
    }

    syncActivePlayer(scene);

    // Grant brief invincibility for transition
    playerState.powerUps.invincibility = 3000;

    // Disable ship rebuild during Phase 2
    if (gameState.rebuildObjective) {
        gameState.rebuildObjective.active = false;
        gameState.rebuildObjective.stage = null;
    }
}

// Spawns interior conduits/security nodes and seeds initial defender waves.
function spawnInteriorObjectives(scene) {
    const objective = gameState.mothershipObjective;
    const cfg = MOTHERSHIP_INTERIOR_CONFIG;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;

    // Reset interior objective counts
    objective.powerConduitsTotal = cfg.powerConduitCount;
    objective.powerConduitsRemaining = cfg.powerConduitCount;
    objective.securityNodesTotal = cfg.securityNodeCount;
    objective.securityNodesRemaining = cfg.securityNodeCount;
    objective.coreChamberOpen = false;
    objective.coreChamberActive = false;
    objective.coreChamberHp = 0;
    objective.coreChamberHpMax = cfg.coreChamberHp;
    objective.interiorReinforcementTimer = 0;

    // Spread power conduits across the world width
    const conduitSpacing = CONFIG.worldWidth / (cfg.powerConduitCount + 1);
    for (let i = 0; i < cfg.powerConduitCount; i++) {
        const cx = conduitSpacing * (i + 1) + (Math.random() - 0.5) * 100;
        const terrainVar = Math.sin(cx / 200) * 30;
        const fallbackY = Math.max(120, groundLevel - terrainVar - 20);
        const cy = getInteriorAnchorY(scene, cx, fallbackY, 20);

        const conduit = createInteriorComponent(
            scene, cx, cy,
            'assaultTurret',       // reuse turret texture for conduit
            'power_conduit',
            cfg.powerConduitHp
        );
        conduit.setTint(0x00ffff); // Cyan tint to distinguish
    }

    // Spread security nodes across the world
    const nodeSpacing = CONFIG.worldWidth / (cfg.securityNodeCount + 1);
    for (let i = 0; i < cfg.securityNodeCount; i++) {
        const nx = nodeSpacing * (i + 1) + (Math.random() - 0.5) * 150;
        const terrainVar = Math.sin(nx / 200) * 30;
        const fallbackY = Math.max(100, groundLevel - terrainVar - 40);
        const ny = getInteriorAnchorY(scene, nx, fallbackY, 40);

        const node = createInteriorComponent(
            scene, nx, ny,
            'assaultShieldGen',    // reuse shield gen texture for node
            'security_node',
            cfg.securityNodeHp
        );
        node.setTint(0xff00ff);   // Magenta tint to distinguish
    }

    // Spawn initial interior defenders
    spawnInteriorDefenders(scene, 4);
}

// Creates one interior objective target entity with role-specific metadata and stats.
function createInteriorComponent(scene, x, y, texture, role, hp) {
    const component = scene.assaultTargets.create(x, y, texture);
    component.setDepth(FG_DEPTH_BASE + 3);
    component.setImmovable(true);
    component.body.setAllowGravity(false);
    component.body.setVelocity(0, 0);
    component.assaultRole = role;
    component.interiorTarget = true;
    component.hp = hp;
    component.maxHp = hp;
    component.nextShot = Phaser.Math.Between(800, 1800);
    return component;
}

// Spawns a batch of interior defender enemies near the current camera region.
function spawnInteriorDefenders(scene, count) {
    const cfg = MOTHERSHIP_INTERIOR_CONFIG;
    const camX = scene.cameras.main ? scene.cameras.main.scrollX : 0;

    for (let i = 0; i < count; i++) {
        const type = Phaser.Utils.Array.GetRandom(cfg.interiorEnemyTypes);
        const spawnX = wrapValue(
            camX + CONFIG.width * 0.3 + Math.random() * CONFIG.width * 0.4,
            CONFIG.worldWidth
        );
        const spawnY = CONFIG.height * 0.2 + Math.random() * CONFIG.height * 0.5;
        spawnEnemy(scene, type, spawnX, spawnY, false);
    }
}

// Spawns the interior reactor core chamber once prerequisite interior targets are cleared.
function spawnCoreChamber(scene) {
    const objective = gameState.mothershipObjective;
    const cfg = MOTHERSHIP_INTERIOR_CONFIG;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;

    // Place core chamber at center of world
    const coreX = CONFIG.worldWidth * 0.5;
    const terrainVar = Math.sin(coreX / 200) * 30;
    const fallbackY = Math.max(140, groundLevel - terrainVar - 30);
    const coreY = getInteriorAnchorY(scene, coreX, fallbackY, 30);

    const core = createInteriorComponent(
        scene, coreX, coreY,
        'assaultBaseRaider',   // reuse base texture for the core chamber
        'interior_core',
        cfg.coreChamberHp
    );
    core.setTint(0xffaa00);    // Orange/gold tint for the reactor core
    core.setScale(1.3);

    objective.coreChamberActive = true;
    objective.coreChamberHp = cfg.coreChamberHp;
    objective.coreChamberHpMax = cfg.coreChamberHp;

    showRebuildObjectiveBanner(scene, 'CORE CHAMBER EXPOSED\nDestroy the reactor core!', '#ffaa00');

    // Spawn extra defenders around the core
    spawnInteriorDefenders(scene, 3);
}

// Updates interior objective UI, reinforcement cadence, and interior turret firing.
function updateMothershipInterior(scene, delta) {
    const objective = gameState.mothershipObjective;
    if (!objective || !objective.interiorPhase) return;

    // Wait for interior to be fully initialized
    if (!objective.interiorStarted) return;

    // Enforce ship lock: prevent rebuild during Phase 2
    if (gameState.rebuildObjective && gameState.rebuildObjective.active) {
        if (objective.shipLocked) {
            gameState.rebuildObjective.active = false;
            gameState.rebuildObjective.stage = null;
        }
    }

    // Prevent re-entering the Aegis during Phase 2
    if (objective.shipLocked && aegisState.active) {
        ejectPilot(scene);
        aegisState.destroyed = true;
        if (scene.aegis) {
            scene.aegis.setActive(false).setVisible(false);
            scene.aegis.body.enable = false;
        }
        syncActivePlayer(scene);
    }

    // Update HUD
    if (!objective.coreChamberOpen) {
        const totalGates = objective.powerConduitsTotal + objective.securityNodesTotal;
        const remaining = objective.powerConduitsRemaining + objective.securityNodesRemaining;
        objective.phaseLabel = 'PHASE 2 - INTERIOR';
        objective.gateLabel = `Targets: ${remaining}/${totalGates} remaining`;
        objective.gateColor = remaining > 0 ? '#ff00ff' : '#00ff00';
        objective.bossHp = remaining;
        objective.bossHpMax = totalGates;
    } else if (objective.coreChamberActive) {
        objective.phaseLabel = 'PHASE 2 - CORE CHAMBER';
        objective.gateLabel = 'Destroy the reactor core!';
        objective.gateColor = '#ffaa00';
        objective.bossHp = objective.coreChamberHp;
        objective.bossHpMax = objective.coreChamberHpMax;
    }

    // Check if all conduits and nodes are destroyed -> open core chamber
    if (!objective.coreChamberOpen
        && objective.powerConduitsRemaining <= 0
        && objective.securityNodesRemaining <= 0) {
        objective.coreChamberOpen = true;
        spawnCoreChamber(scene);
    }

    // Interior reinforcements
    objective.interiorReinforcementTimer += delta;
    const reinforceInterval = MOTHERSHIP_INTERIOR_CONFIG.reinforcementInterval;
    if (objective.interiorReinforcementTimer >= reinforceInterval) {
        objective.interiorReinforcementTimer = 0;

        // Only spawn if not too many enemies active
        const activeEnemies = scene.enemies ? scene.enemies.countActive(true) : 0;
        if (activeEnemies < 8) {
            spawnInteriorDefenders(scene, MOTHERSHIP_INTERIOR_CONFIG.reinforcementBatch);
        }
    }

    // Interior turret fire from conduits/nodes (reuse existing turret fire pattern)
    const interiorTargets = scene.assaultTargets?.children?.entries;
    if (Array.isArray(interiorTargets)) {
        const now = scene.time?.now || 0;
        interiorTargets.forEach(target => {
            if (!target || !target.active || !target.interiorTarget) return;
            if (target.assaultRole === 'interior_core') return; // Core doesn't shoot

            if (now >= (target.nextShot || 0)) {
                fireInteriorTurret(scene, target);
                target.nextShot = now + 1200 + Math.random() * 1000;
            }
        });
    }
}

// Fires one aimed projectile from an interior target turret toward the active player.
function fireInteriorTurret(scene, turret) {
    if (!scene || !turret || !turret.active) return;
    const projectileGroup = scene.enemyProjectiles;
    if (!projectileGroup || typeof projectileGroup.create !== 'function') return;

    const player = getActivePlayer(scene);
    if (!player || !player.active) return;

    const angle = Phaser.Math.Angle.Between(turret.x, turret.y, player.x, player.y);
    const speed = 180;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const proj = projectileGroup.create(turret.x, turret.y, 'enemyProjectile');
    if (!proj) return;
    proj.setDepth(FG_DEPTH_BASE + 1);
    if (proj.body) {
        proj.body.setAllowGravity(false);
    }
    proj.setVelocity(vx, vy);
    proj.damage = 1;

    // Tint based on turret type
    if (turret.assaultRole === 'power_conduit') {
        proj.setTint(0x00ffff);
    } else if (turret.assaultRole === 'security_node') {
        proj.setTint(0xff00ff);
    }

    // Auto-destroy after 4 seconds
    scene.time.delayedCall(4000, () => {
        if (proj && proj.active) proj.destroy();
    });
}

// Handles damage/destruction logic for interior targets and win condition on core kill.
function hitInteriorTarget(projectile, target) {
    const objective = gameState.mothershipObjective;
    if (!objective || !objective.interiorPhase || !target.active || !target.interiorTarget) {
        if (projectile && projectile.active) projectile.destroy();
        return;
    }

    const scene = projectile.scene;
    const damage = projectile.damage || 1;

    target.hp -= damage;

    // Flash feedback
    target.setTint(0xff0000);
    scene.time.delayedCall(60, () => {
        if (target && target.active) {
            // Restore role-based tint
            if (target.assaultRole === 'power_conduit') target.setTint(0x00ffff);
            else if (target.assaultRole === 'security_node') target.setTint(0xff00ff);
            else if (target.assaultRole === 'interior_core') target.setTint(0xffaa00);
            else target.clearTint();
        }
    });

    if (target.hp <= 0) {
        // Determine what was destroyed
        if (target.assaultRole === 'power_conduit') {
            objective.powerConduitsRemaining = Math.max(0, objective.powerConduitsRemaining - 1);
            createExplosion(scene, target.x, target.y, 0x00ffff);
            createFloatingText(scene, target.x, target.y - 30, 'CONDUIT DESTROYED', '#00ffff');
            gameState.score += getMissionScaledReward(500);
        } else if (target.assaultRole === 'security_node') {
            objective.securityNodesRemaining = Math.max(0, objective.securityNodesRemaining - 1);
            createExplosion(scene, target.x, target.y, 0xff00ff);
            createFloatingText(scene, target.x, target.y - 30, 'NODE DESTROYED', '#ff00ff');
            gameState.score += getMissionScaledReward(750);
        } else if (target.assaultRole === 'interior_core') {
            // CORE CHAMBER DESTROYED - Game won!
            objective.coreChamberHp = 0;
            objective.coreChamberActive = false;
            createExplosion(scene, target.x, target.y, 0xffaa00);
            createExplosion(scene, target.x - 30, target.y + 10, 0xff6b35);
            createExplosion(scene, target.x + 30, target.y - 10, 0xff6b35);
            screenShake(scene, 30, 800);
            gameState.score += getMissionScaledReward(8000);

            target.destroy();
            objective.active = false;
            objective.interiorPhase = false;

            showRebuildObjectiveBanner(scene, 'REACTOR CORE DESTROYED\nMOTHERSHIP ELIMINATED!', '#00ff00');

            scene.time.delayedCall(2000, () => {
                winGame(scene);
            });
            if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
            return;
        }

        target.destroy();
    }

    // Update core chamber HP tracking
    if (target.assaultRole === 'interior_core' && target.active) {
        objective.coreChamberHp = Math.max(0, target.hp);
    }

    if (projectile && projectile.active && !projectile.isPiercing) projectile.destroy();
}
