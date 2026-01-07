// ------------------------
// file: js/entities/player/playerHumans.js
// ------------------------

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

function rescueHuman(playerSprite, human) {
    const audioManager = this.audioManager;
    if (!human.isAbducted) return;
    gameState.humansRescued++;
    const reward = getMissionScaledReward(1000);
    gameState.score += reward;
    if (audioManager) audioManager.playSound('humanRescued');
    const rescueText = this.add.text(
        human.x,
        human.y - 20,
        `+${reward} RESCUED!`,
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
    if (Math.random() < 0.4) spawnPowerUp(this, human.x, human.y);
}

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
