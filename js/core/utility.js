// ------------------------
// File: js/core/utility.js
// ------------------------

// Wraps a sprite horizontally so it stays within the cyclic world width.
function wrapWorldBounds(sprite) {
    const worldWidth = CONFIG.worldWidth;
    let wrappedX = sprite.x % worldWidth;
    if (wrappedX < 0) wrappedX += worldWidth;
    if (wrappedX !== sprite.x) sprite.x = wrappedX;
}

// Spawns an explosion VFX burst and plays explosion SFX at the provided world position.
function createExplosion(scene, x, y, color = 0xffff00) {
    const audioManager = scene?.audioManager;
    if (audioManager) audioManager.playSound('explosion');
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const particleScale = reduceFlashes ? 0.35 : 0.5;
    const particleCount = reduceFlashes ? 4 : 8;
    for (let i = 0; i < particleCount; i++) {
        const particle = scene.add.sprite(x, y, 'explosion');
        particle.setTint(color);
        const angle = (Math.PI * 2 / 8) * i;
        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            alpha: 0,
            scale: particleScale,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
}

// Plays the enemy spawn visual effect with type-specific tinting and flash-reduction support.
function createSpawnEffect(scene, x, y, enemyType) {
    const colors = {
        'lander': 0xff4444,
        'mutant': 0xff8844,
        'drone': 0xff44ff,
        'bomber': 0xff0000,
        'pod': 0xaa00ff,
        'swarmer': 0x00ff00,
        'baiter': 0xff00ff
    };
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const color = colors[enemyType] || 0xff4444;
    const particleCount = reduceFlashes ? 6 : 12;
    const particleScale = reduceFlashes ? 0.5 : 0.8;
    const flashAlpha = reduceFlashes ? 0.4 : 0.7;
    for (let i = 0; i < particleCount; i++) {
        const particle = scene.add.sprite(x, y, 'explosion');
        particle.setTint(color);
        particle.setScale(particleScale);
        const angle = (Math.PI * 2 / 12) * i;
        const startX = x + Math.cos(angle) * 5;
        const startY = y + Math.sin(angle) * 5;
        scene.tweens.add({
            targets: particle,
            x: startX + Math.cos(angle) * 40,
            y: startY + Math.sin(angle) * 40,
            alpha: 0,
            scale: 0.2,
            duration: 400,
            ease: 'Power2.easeOut',
            onComplete: () => particle.destroy()
        });
    }
    const flash = scene.add.sprite(x, y, 'explosion');
    flash.setTint(color);
    flash.setScale(2);
    flash.setAlpha(flashAlpha);
    scene.tweens.add({
        targets: flash,
        scale: 0.5,
        alpha: 0,
        duration: 300,
        ease: 'Power2.easeOut',
        onComplete: () => flash.destroy()
    });
}

// Applies a brief camera shake impulse and tweened settle-back for impact feedback.
function screenShake(scene, intensity = 10, duration = 200) {
    if (!scene.cameras || !scene.cameras.main) return;
    const camera = scene.cameras.main;
    const originalX = camera.scrollX;
    const originalY = camera.scrollY;
    camera.setScroll(
        originalX + (Math.random() - 0.5) * intensity,
        originalY + (Math.random() - 0.5) * intensity
    );
    scene.tweens.add({
        targets: camera,
        scrollX: originalX,
        scrollY: originalY,
        duration: duration,
        ease: 'Power2.easeOut'
    });
}

// Creates collection feedback effects for power-ups and shakes camera for high-impact pickups.
function createPowerUpCollectionEffect(scene, x, y, powerUpType) {
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const flash = scene.add.circle(x, y, 30, 0xffffff, reduceFlashes ? 0.4 : 0.8);
    flash.setDepth(50);
    scene.tweens.add({
        targets: flash,
        radius: 80,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => flash.destroy()
    });
    const particleCount = reduceFlashes ? 4 : 6;
    const particleDistance = reduceFlashes ? 30 : 40;
    for (let i = 0; i < particleCount; i++) {
        const particle = scene.add.circle(x, y, 3, 0x00ff00, 1);
        const angle = (Math.PI * 2 / 6) * i;
        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * particleDistance,
            y: y + Math.sin(angle) * particleDistance,
            alpha: 0,
            scale: 0.2,
            duration: 500,
            delay: i * 50,
            onComplete: () => particle.destroy()
        });
    }
    const powerfulTypes = ['double', 'invincibility', 'timeSlow', 'overdrive'];
    if (powerfulTypes.includes(powerUpType)) {
        const shakeIntensity = reduceFlashes ? 4 : 8;
        screenShake(scene, shakeIntensity, 150);
    }
}

// Plays a distinct upgrade burst effect when a comrade receives an upgrade.
function createComradeUpgradeEffect(scene, x, y) {
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const ringColor = 0x60a5fa;
    const ring = scene.add.circle(x, y, 18, ringColor, reduceFlashes ? 0.25 : 0.5);
    ring.setDepth(55);
    scene.tweens.add({
        targets: ring,
        radius: reduceFlashes ? 40 : 55,
        alpha: 0,
        duration: 500,
        ease: 'Power2.easeOut',
        onComplete: () => ring.destroy()
    });
    const shardCount = reduceFlashes ? 4 : 8;
    for (let i = 0; i < shardCount; i++) {
        const shard = scene.add.circle(x, y, 3, ringColor, 1);
        const angle = (Math.PI * 2 / shardCount) * i;
        scene.tweens.add({
            targets: shard,
            x: x + Math.cos(angle) * (reduceFlashes ? 28 : 40),
            y: y + Math.sin(angle) * (reduceFlashes ? 28 : 40),
            alpha: 0,
            scale: 0.2,
            duration: 500,
            delay: i * 40,
            onComplete: () => shard.destroy()
        });
    }
    const shakeIntensity = reduceFlashes ? 3 : 6;
    screenShake(scene, shakeIntensity, 140);
}

// Renders a multi-ring death burst effect tuned by enemy type and accessibility settings.
function createEnhancedDeathEffect(scene, x, y, enemyType) {
    const deathColors = {
        'lander': 0xff4444,
        'mutant': 0xff8844,
        'drone': 0xff44ff,
        'bomber': 0xff0000,
        'pod': 0xaa00ff,
        'swarmer': 0x00ff00,
        'baiter': 0xff00ff
    };
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const color = deathColors[enemyType] || 0xff4444;
    const ringCount = reduceFlashes ? 1 : 2;
    const blastRadius = reduceFlashes ? 25 : 40;
    const particleDistanceBase = reduceFlashes ? 40 : 60;
    for (let ring = 0; ring < ringCount; ring++) {
        setTimeout(() => {
            for (let i = 0; i < 16; i++) {
                const particle = scene.add.circle(x, y, 2 + ring, color, 1);
                const angle = (Math.PI * 2 / 16) * i;
                const distance = particleDistanceBase + (ring * 20);
                scene.tweens.add({
                    targets: particle,
                    x: x + Math.cos(angle) * distance,
                    y: y + Math.sin(angle) * distance,
                    alpha: 0,
                    scale: 0.1,
                    duration: 600 + ring * 200,
                    delay: ring * 100,
                    onComplete: () => particle.destroy()
                });
            }
        }, ring * 80);
    }
    const blast = scene.add.circle(x, y, 8, color, 1);
    scene.tweens.add({
        targets: blast,
        radius: blastRadius,
        alpha: 0,
        duration: 400,
        ease: 'Power2.easeOut',
        onComplete: () => blast.destroy()
    });
}

// Calculates responsive game viewport dimensions based on available layout space and device constraints.
function getResponsiveScale() {
    const isMobile = window.innerWidth <= 900;
    const isLandscape = window.innerWidth > window.innerHeight;
    const hud = document.getElementById('hud-container');
    const controls = document.getElementById('controls-text');
    const touchControls = document.getElementById('touch-controls');
    const footer = document.getElementById('footer-note');
    const buildControls = document.getElementById('build-controls');
    const gameContainer = document.getElementById('game-container');

    /**
     * Handles the getOuterHeight routine and encapsulates its core gameplay logic.
     * Parameters: el.
     * Returns: value defined by the surrounding game flow.
     */
    const getOuterHeight = (el) => {
        if (!el) return 0;
        const styles = window.getComputedStyle(el);
        const marginTop = parseFloat(styles.marginTop) || 0;
        const marginBottom = parseFloat(styles.marginBottom) || 0;
        return el.offsetHeight + marginTop + marginBottom;
    };

    const reservedHeight = getOuterHeight(hud) + getOuterHeight(controls) + getOuterHeight(buildControls) + getOuterHeight(touchControls) + getOuterHeight(footer) + 16;
    const containerWidth = gameContainer?.clientWidth || 0;
    const maxWidth = Math.max(320, containerWidth || window.innerWidth - 24);
    let maxHeight = Math.max(180, window.innerHeight - reservedHeight);

    const baseWidth = CONFIG.width;
    const baseHeight = CONFIG.height;
    const scaleX = maxWidth / baseWidth;
    const scaleY = maxHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY);
    const maxScale = isMobile ? 1 : 2;
    const finalScale = Math.min(scale, maxScale);
    return {
        width: Math.floor(baseWidth * finalScale),
        height: Math.floor(baseHeight * finalScale),
        scale: finalScale
    };
}

// Converts world coordinates into current screen-space coordinates using camera scroll offsets.
function getScreenPosition(scene, worldX, worldY) {
    const cam = scene.cameras.main;
    return {
        x: worldX - cam.scrollX,
        y: worldY - cam.scrollY
    };
}

// Starts or restarts gameplay in the selected mode, applying mission payload and scene transitions.
function startGame(mode = 'classic') {
    const missionPayload = window.missionPlanner ? missionPlanner.prepareLaunchPayload(mode) : null;
    const effectiveMode = missionPayload?.mode || mode;
    resetGameState();
    gameState.mode = effectiveMode;
    applyMissionPayload(missionPayload);
    if (window.metaProgression?.applyLoadoutEffects) {
        gameState.metaAppliedLoadout = metaProgression.applyLoadoutEffects(gameState, playerState);
    }
    if (effectiveMode === 'survival') gameState.timeRemaining = gameState.totalSurvivalDuration;
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';

    // Switch to game layout
    if (window.DistrictLayoutManager) {
        DistrictLayoutManager.switchToGameLayout();
    }

    if (window.Phaser && window.game && game.scene) {
        const scene = game.scene.getScene(SCENE_KEYS.game);
        if (scene && scene.scene) {
            if (scene.scene.isActive()) {
                scene.scene.restart();
            } else {
                game.scene.start(SCENE_KEYS.game);
            }
        } else if (game.scene) {
            game.scene.start(SCENE_KEYS.game);
        }
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.stop(SCENE_KEYS.menu);
        }
    }

    // Update UI buttons
    const toggleBtn = document.getElementById('build-toggle');
    if (toggleBtn) toggleBtn.classList.remove('hidden');

    const mainScene = game?.scene?.getScene ? game.scene.getScene(SCENE_KEYS.game) : null;
    const audioManager = mainScene?.audioManager;
    if (audioManager && audioManager.audioContext.state === 'suspended') {
        audioManager.audioContext.resume().catch(() => {});
    }
}

window.startGame = startGame;

// Applies mission directive multipliers and contextual state from the district planner payload.
function applyMissionPayload(missionPayload) {
    if (!missionPayload) {
        gameState.missionContext = null;
        gameState.missionDirectives = null;
        gameState.rewardMultiplier = 1;
        gameState.spawnMultiplier = 1;
        gameState.clutchDefenseBonus = 0;
        gameState.missionDistrictState = null;
        CONFIG.backgroundStyle = null;
        return;
    }
    gameState.missionContext = missionPayload;
    gameState.missionDirectives = missionPayload.directives;
    gameState.missionDistrictState = missionPayload.districtState || missionPayload.directives?.districtState || null;
    gameState.rewardMultiplier = missionPayload?.directives?.rewardMultiplier || 1;
    gameState.spawnMultiplier = missionPayload?.directives?.spawnMultiplier || 1;
    gameState.clutchDefenseBonus = missionPayload?.directives?.clutchDefenseBonus || 0;
    CONFIG.backgroundStyle = missionPayload?.directives?.backgroundStyle || null;
    if (missionPayload?.directives?.humans) {
        gameState.humans = missionPayload.directives.humans;
    }
}

// Returns a reward value scaled by the current mission reward multiplier.
function getMissionScaledReward(base) {
    return Math.round(base * (gameState.rewardMultiplier || 1));
}

// Returns a reward value scaled by both mission and live combo multipliers.
function getCombatScaledReward(base) {
    const comboMultiplier = gameState.comboMultiplier || 1;
    return Math.round(getMissionScaledReward(base) * comboMultiplier);
}

// Resets combo stacks, timer, multiplier, and flow status to baseline values.
function resetComboMeter() {
    gameState.comboStacks = 0;
    gameState.comboTimer = 0;
    gameState.comboMultiplier = 1;
    gameState.comboFlowActive = false;
}

// Recomputes combo multiplier from current stack count and combo configuration thresholds.
function refreshComboMultiplier() {
    const steps = Math.floor((gameState.comboStacks || 0) / COMBO_CONFIG.stepSize);
    const bonus = Math.min(COMBO_CONFIG.maxBonus, steps * COMBO_CONFIG.stepBonus);
    gameState.comboMultiplier = 1 + bonus;
}

// Adds combo stacks, refreshes decay timer, and updates combo multiplier/max-stack tracking.
function registerComboEvent(stacks = 1) {
    const nextStacks = Math.min(COMBO_CONFIG.maxStacks, (gameState.comboStacks || 0) + stacks);
    gameState.comboStacks = nextStacks;
    gameState.comboMaxStacks = Math.max(gameState.comboMaxStacks || 0, nextStacks);
    gameState.comboTimer = COMBO_CONFIG.decayMs;
    refreshComboMultiplier();
}

// Selects the current best movement objective (boss/base/nearest enemy) for combo-flow evaluation.
function getComboObjective(scene, player) {
    if (!scene || !player) return null;
    if (gameState.mode === 'assault' && gameState.assaultObjective?.baseX) {
        return { x: gameState.assaultObjective.baseX, y: player.y };
    }
    if (gameState.mode === 'mothership') {
        const boss = scene.bosses?.children?.entries?.find(entry => entry.active);
        if (boss) return { x: boss.x, y: boss.y };
    }
    const activeBoss = scene.bosses?.children?.entries?.find(entry => entry.active);
    if (activeBoss) return { x: activeBoss.x, y: activeBoss.y };
    const enemies = scene.enemies?.children?.entries || [];
    if (!enemies.length) return null;
    let best = null;
    let bestDist = Infinity;
    enemies.forEach(enemy => {
        if (!enemy || !enemy.active) return;
        const dx = typeof wrappedDistance === 'function'
            ? wrappedDistance(player.x, enemy.x, CONFIG.worldWidth)
            : (enemy.x - player.x);
        const dy = enemy.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < bestDist) {
            best = enemy;
            bestDist = dist;
        }
    });
    return best ? { x: best.x, y: best.y } : null;
}

// Determines whether the player is moving toward the active combo objective target.
function isMovingTowardObjective(scene, player) {
    if (!scene || !player || !player.body) return false;
    const target = getComboObjective(scene, player);
    if (!target) return false;
    const dx = typeof wrappedDistance === 'function'
        ? wrappedDistance(player.x, target.x, CONFIG.worldWidth)
        : (target.x - player.x);
    const velocity = player.body.velocity || { x: 0, y: 0 };
    const speed = Math.hypot(velocity.x || 0, velocity.y || 0);
    if (Math.abs(dx) < 40) return true;
    if (speed < 20) return false;
    return Math.sign(dx) === Math.sign(velocity.x || 0);
}

// Updates combo flow/timer decay and resets combo state when momentum is lost long enough.
function updateComboState(scene, delta) {
    if (!gameState.comboStacks) {
        gameState.comboFlowActive = false;
        return;
    }
    const flowActive = isMovingTowardObjective(scene, getActivePlayer(scene));
    gameState.comboFlowActive = flowActive;
    if (!flowActive) {
        gameState.comboTimer = Math.max(0, (gameState.comboTimer || 0) - delta);
        if (gameState.comboTimer === 0) {
            resetComboMeter();
        }
    }
}

// Routes the player to title/menu scenes and updates overlays based on briefing state.
function enterMainMenu() {
    const sawBriefing = localStorage.getItem('sawBriefing') === 'true';

    if (!sawBriefing && window.game && game.scene) {
        const menu = document.getElementById('menu-overlay');
        if (menu) menu.style.display = 'none';

        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.game)) {
            game.scene.stop(SCENE_KEYS.game);
        }
        game.scene.start(SCENE_KEYS.title);
        return;
    }

    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'flex';

    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.game)) {
            game.scene.stop(SCENE_KEYS.game);
        }
        game.scene.start(SCENE_KEYS.menu);
    }
}

// Opens the menu overlay and pauses gameplay when settings are opened mid-run.
function openSettingsMenu() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'flex';

    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.game)) {
            const main = game.scene.getScene(SCENE_KEYS.game);
            if (main && main.scene.isActive()) {
                main.scene.pause();
            }
        }
    }
}

// Switches from gameplay/menu into district map layout and manages scene lifecycle transitions.
function enterDistrictMap(options = false) {
    const fromVictory = typeof options === 'object' ? !!options.fromVictory : false;
    
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';
    
    // 1. Switch DOM Layout
    if (window.DistrictLayoutManager) {
        DistrictLayoutManager.switchToDistrictLayout();
    }

    // 2. Manage Scenes
    if (window.game && game.scene) {
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        
        // Stop or Pause the Action Game
        if (mainScene && mainScene.scene.isActive()) {
            if (fromVictory) {
                mainScene.scene.stop();
            } else {
                mainScene.scene.pause();
                // Ensure the game scene is hidden so it doesn't bleed through
                mainScene.scene.setVisible(false);
            }
        }
        
        // Stop Menu if active
        if (game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.stop(SCENE_KEYS.menu);
        }
        
        // 3. Start/Restart the Build Scene
        // Using 'start' ensures the scene runs its create() method again,
        // rebuilding the map with updated data.
        game.scene.start(SCENE_KEYS.build);
        game.scene.bringToTop(SCENE_KEYS.build);
        
        // REMOVED: game.scene.setVisible(...) - This was causing the crash. 
        // Scene visibility is handled by the Scene object, not the SceneManager.
    }
}

// Convenience helper to hide menus and enter the district build/map scene.
function openBuildView() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';
    enterDistrictMap();
}

// Returns from district build view back to gameplay layout and resumes the main scene when possible.
function closeBuildView() {
    // Switch back to game layout
    if (window.DistrictLayoutManager) {
        DistrictLayoutManager.switchToGameLayout();
    }
    
    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        if (mainScene) {
            // Resume or Start Game
            if (mainScene.scene.isPaused()) {
                mainScene.scene.resume();
                mainScene.scene.setVisible(true); // Make sure it's visible again
            } else if (!mainScene.scene.isActive()) {
                // If it was stopped (e.g. from victory), maybe don't auto-start,
                // but if we are "Closing" the map, we usually return to context.
                // For now, assume resume logic is primary.
            }
        }
    }

    const toggleBtn = document.getElementById('build-toggle');
    if (toggleBtn) toggleBtn.classList.remove('hidden');
}

// Launches the currently selected district mission or falls back to starting the planned mode.
function launchSelectedMission() {
    const buildScene = game?.scene?.getScene ? game.scene.getScene(SCENE_KEYS.build) : null;
    if (buildScene && buildScene.scene && buildScene.scene.isActive()) {
        buildScene.launchMission();
        return;
    }

    const mission = missionPlanner?.getMission ? missionPlanner.getMission() : null;
    if (mission) {
        startGame(mission.mode || 'classic');
    }
}

window.openBuildView = openBuildView;
window.closeBuildView = closeBuildView;
window.enterMainMenu = enterMainMenu;
window.enterDistrictMap = enterDistrictMap;
window.launchSelectedMission = launchSelectedMission;
window.openSettingsMenu = openSettingsMenu;
