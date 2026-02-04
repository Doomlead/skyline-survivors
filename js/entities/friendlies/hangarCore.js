// ------------------------
// Hangar Core - Defense Map Extraction Hub
// ------------------------

const HANGAR_CONFIG = {
    texture: 'hangar',
    scale: 1.5,
    groundOffset: 6
};

function isDefenseMission() {
    return gameState.mode !== 'assault'
        && gameState.mode !== 'mothership'
        && gameState.mode !== 'survival';
}

function spawnDefenseHangar(scene) {
    if (!scene || !scene.friendlies || !isDefenseMission()) return null;

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const spawnX = scene.veritech ? scene.veritech.x : CONFIG.worldWidth * 0.5;
    const spawnY = scene.veritech ? scene.veritech.y : null;
    const terrainVariation = Math.sin(spawnX / 200) * 30;
    const hangarX = spawnX;
    const hangarY = spawnY !== null
        ? spawnY
        : groundLevel - terrainVariation + HANGAR_CONFIG.groundOffset;

    const hangar = scene.friendlies.create(hangarX, hangarY, HANGAR_CONFIG.texture);
    hangar.setOrigin(0.5, 1);
    hangar.setDepth(FG_DEPTH_BASE + 1);
    hangar.setScale(HANGAR_CONFIG.scale);
    hangar.setImmovable(true);
    if (hangar.body) {
        hangar.body.setAllowGravity(false);
        hangar.body.setVelocity(0, 0);
    }
    hangar.isHangar = true;
    hangar.baseY = hangarY;
    hangar.blinkOffset = Math.random() * Math.PI * 2;
    hangar.rebuildZone = scene.add.sprite(
        hangarX,
        groundLevel - terrainVariation - 12,
        'hangar_rebuild_zone'
    );
    hangar.rebuildZone.setOrigin(0.5, 0.5);
    hangar.rebuildZone.setDepth(FG_DEPTH_BASE);
    hangar.rebuildZone.setAlpha(0.6);
    hangar.rebuildZone.setVisible(false);

    scene.hangar = hangar;
    return hangar;
}

function setupDefenseHangar(scene) {
    if (scene.hangar && scene.hangar.active) return scene.hangar;
    return spawnDefenseHangar(scene);
}
