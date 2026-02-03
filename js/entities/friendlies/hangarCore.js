// ------------------------
// Hangar Core - Friendly Drop-off Hub
// ------------------------

const HANGAR_CONFIG = {
    groundOffset: 36,
    baseScale: 1.1
};

function getHangarGroundY(scene, x) {
    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(x / 200) * 30;
    return Math.max(120, groundLevel - terrainVariation - HANGAR_CONFIG.groundOffset);
}

function createHangar(scene, x) {
    if (!scene.friendlies) return null;
    const hangar = scene.friendlies.create(x, 0, 'hangar');
    hangar.setScale(HANGAR_CONFIG.baseScale);
    hangar.setDepth(FG_DEPTH_BASE + 2);
    hangar.setImmovable(true);
    hangar.body.setAllowGravity(false);
    hangar.body.setVelocity(0, 0);
    hangar.friendlyType = 'hangar';
    hangar.beaconTimer = Phaser.Math.Between(0, 800);
    hangar.body.setSize(110, 40);
    hangar.body.setOffset(15, 24);

    const groundY = getHangarGroundY(scene, x);
    hangar.setPosition(x, groundY);
    scene.hangar = hangar;
    return hangar;
}

function setupHangar(scene) {
    if (!scene || !scene.friendlies) return;
    if (scene.hangar && scene.hangar.active) return;
    const spawnX = CONFIG.worldWidth * 0.5;
    createHangar(scene, spawnX);
}
