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
}

// Handles human rescue pickup, scoring/cargo updates, and rescue feedback effects.
function rescueHuman(playerSprite, human) {
    const audioManager = this.audioManager;
    const isFalling = Boolean(human.body && human.body.gravity && human.body.gravity.y > 0);
    if (!human.isAbducted && !isFalling) return;
    gameState.humansRescued++;
    const wasLiberatedCaptive = Boolean(human.isLiberatedCaptive);
    const cargoCount = window.ShipController?.addCargo(1, { liberated: wasLiberatedCaptive }) ?? 0;
    if (wasLiberatedCaptive) {
        if (!gameState.liberationTelemetry) {
            gameState.liberationTelemetry = { liberated: 0, rescued: 0, delivered: 0, bonusScore: 0, ammoGranted: 0 };
        }
        gameState.liberationTelemetry.rescued = (gameState.liberationTelemetry.rescued || 0) + 1;
    }
    registerComboEvent(1);
    const rescueScore = getCombatScaledReward(HUMAN_RESCUE_SCORE);
    gameState.score += rescueScore;
    if (audioManager) audioManager.playSound('humanRescued');
    if (typeof grantPilotAmmoByRescueDeliveryBonus === 'function') {
        const ammoResult = grantPilotAmmoByRescueDeliveryBonus(1, wasLiberatedCaptive ? 'liberation_rescue' : 'rescue');
        if (ammoResult?.granted > 0 && wasLiberatedCaptive) {
            createFloatingText(this, human.x, human.y - 34, `LIBERATION AMMO +${ammoResult.granted}`, '#22d3ee');
        }
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
    });
}
