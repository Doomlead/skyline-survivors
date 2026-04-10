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
    human.captiveBubble = null;
}

// Spawns a liberated assault captive that drifts down in a stasis bubble before pickup.
function spawnLiberatedCaptive(scene, x, y, sourceType = 'stasis_array') {
    const { humans } = scene;
    if (!humans) return null;
    const spawnX = wrapValue(x, CONFIG.worldWidth);
    const spawnY = Math.max(40, y);
    const captive = humans.create(spawnX, spawnY, 'human');
    captive.setScale(1.25);
    captive.setDepth(FG_DEPTH_BASE + 2);
    captive.setCollideWorldBounds(false);
    if (captive.body) {
        captive.body.setSize(8, 12);
        captive.body.setGravityY(40);
        captive.body.setMaxVelocity(120, 90);
    }
    captive.isAbducted = false;
    captive.abductor = null;
    captive.isCaptive = true;
    captive.captiveSource = sourceType;
    captive.setTint(0x99f6ff);

    if (scene.add?.image) {
        const bubble = scene.add.image(spawnX, spawnY, 'captiveBubble');
        bubble.setDepth(FG_DEPTH_BASE + 1);
        bubble.setAlpha(0.75);
        bubble.setScale(1.05);
        captive.captiveBubble = bubble;
    }

    return captive;
}

// Handles human rescue pickup, scoring/cargo updates, and rescue feedback effects.
function rescueHuman(playerSprite, human) {
    const audioManager = this.audioManager;
    const isFalling = Boolean(human.body && human.body.gravity && human.body.gravity.y > 0);
    if (!human.isAbducted && !isFalling) return;
    gameState.humansRescued++;
    if (human.isCaptive) {
        gameState.captivesRescued = (gameState.captivesRescued || 0) + 1;
    }
    const cargoCount = window.ShipController?.addCargo(1) ?? 0;
    registerComboEvent(1);
    const rescueScore = getCombatScaledReward(HUMAN_RESCUE_SCORE);
    gameState.score += rescueScore;
    if (audioManager) audioManager.playSound('humanRescued');
    if (typeof pilotState !== 'undefined' && pilotState?.active && typeof refillCurrentPilotWeaponByRescueBonus === 'function') {
        refillCurrentPilotWeaponByRescueBonus();
    }
    if (window.liberationTelemetry?.awardLiberationBonus) {
        window.liberationTelemetry.awardLiberationBonus({
            gameState,
            nowMs: this.time?.now || Date.now(),
            rescued: 1,
            source: human.isCaptive ? 'captive_rescue' : 'human_rescue'
        });
    }
    const rescueText = this.add.text(
        human.x,
        human.y - 20,
        `CARGO +1 (${cargoCount})  +${rescueScore}`,
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
    if (human.captiveBubble?.active) {
        human.captiveBubble.destroy();
        human.captiveBubble = null;
    }
    human.destroy();
    if (Math.random() < 0.24) spawnPowerUp(this, human.x, human.y);
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
            }
        }
        wrapWorldBounds(human);
        if (human.captiveBubble?.active) {
            human.captiveBubble.x = human.x;
            human.captiveBubble.y = human.y;
            human.captiveBubble.alpha = 0.6 + Math.sin((scene.time?.now || 0) * 0.01 + human.x * 0.02) * 0.15;
        } else if (human.captiveBubble && !human.active) {
            human.captiveBubble.destroy();
            human.captiveBubble = null;
        }
    });
}
