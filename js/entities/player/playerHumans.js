// ------------------------
// file: js/entities/player/playerHumans.js
// ------------------------

// Spawns a rescueable human NPC at a wrapped world position with baseline behavior state.
function spawnHuman(scene, x) {
    const { humans } = scene;
    if (!humans) return;
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(x / 200) * 30;
    const y = groundLevel - terrainVariation - 15;
    const human = humans.create(x, y, 'human');
    human.setScale(1.25);
    human.setDepth(FG_DEPTH_BASE + 1);
    human.setCollideWorldBounds(false);
    human.body.setSize(8, 12);
    human.isAbducted = false;
    human.abductor = null;
    human.isCaptive = false;
    human.captiveSource = null;
}

// Handles human rescue pickup, scoring/cargo updates, and rescue feedback effects.
function rescueHuman(playerSprite, human) {
    const audioManager = this.audioManager;
    const isFalling = Boolean(human.body && human.body.gravity && human.body.gravity.y > 0);
    if (!human.isAbducted && !isFalling) return;
    gameState.humansRescued++;
    const cargoCount = window.ShipController?.addCargo(1) ?? 0;
    registerComboEvent(1);
    const rescueScore = getCombatScaledReward(HUMAN_RESCUE_SCORE);
    gameState.score += rescueScore;
    if (audioManager) audioManager.playSound('humanRescued');
    if (typeof pilotState !== 'undefined' && pilotState?.active && typeof refillCurrentPilotWeaponByRescueBonus === 'function') {
        refillCurrentPilotWeaponByRescueBonus();
    }
    const rescueLabel = human.isCaptive ? 'CAPTIVE SECURED' : 'CARGO +1';
    const rescueText = this.add.text(
        human.x,
        human.y - 20,
        `${rescueLabel} (${cargoCount})  +${rescueScore}`,
        {
            fontSize: '16px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5);
    this.tweens.add({
        targets: rescueText,
        y: human.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => rescueText.destroy()
    });
    createExplosion(this, human.x, human.y, 0x00ff00);
    human.destroy();
    if (Math.random() < 0.24) spawnPowerUp(this, human.x, human.y);
}

// Releases captives as falling rescue targets that feed the existing cargo -> operative loop.
function releaseCaptivesFromSource(scene, x, y, count = 1, label = 'CAPTIVES LIBERATED') {
    const { humans } = scene;
    if (!humans || count <= 0) return 0;
    const total = Math.max(1, Math.floor(count));
    for (let i = 0; i < total; i++) {
        const spawnX = wrapValue(x + Phaser.Math.Between(-26, 26), CONFIG.worldWidth);
        const spawnY = Phaser.Math.Clamp(y + Phaser.Math.Between(-18, 12), 20, CONFIG.height - 120);
        const captive = humans.create(spawnX, spawnY, 'human');
        captive.setScale(1.25);
        captive.setDepth(FG_DEPTH_BASE + 1);
        captive.setCollideWorldBounds(false);
        if (captive.body) {
            captive.body.setSize(8, 12);
            captive.body.setGravityY(65);
            captive.body.setMaxVelocity(180, 120);
        }
        captive.isAbducted = false;
        captive.abductor = null;
        captive.isCaptive = true;
        captive.captiveSource = label;
        captive.setTint(0x93c5fd);
    }

    if (typeof createFloatingText === 'function') {
        createFloatingText(scene, x, y - 18, `${label} x${total}`, '#7dd3fc');
    }
    if (typeof createExplosion === 'function') {
        createExplosion(scene, x, y, 0x38bdf8, 0.5);
    }
    return total;
}

// Updates human wandering/falling behavior and removes invalid human entities each frame.
function updateHumans(scene) {
    const { humans } = scene;
    if (!humans) return;
    humans.children.entries.forEach(human => {
        if (human.body && human.body.gravity && human.body.gravity.y > 0) {
            const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
            const terrainVariation = Math.sin(human.x / 200) * 30;
            const groundY = groundLevel - terrainVariation - 15;
            if (human.y >= groundY) {
                human.y = groundY;
                human.setGravityY(0);
                human.setVelocity(0, 0);
                human.isAbducted = false;
                human.abductor = null;
                human.clearTint();
            }
        }
        wrapWorldBounds(human);
    });
}
