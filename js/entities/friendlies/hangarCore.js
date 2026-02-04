// ------------------------
// Hangar Core - Defense Map Extraction Hub
// ------------------------

const HANGAR_CONFIG = {
    texture: 'hangar',
    scale: 1.5,
    groundOffset: 6,
    markerTexture: 'hangar_marker',
    markerScale: 1,
    markerYOffset: -10
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
    const terrainVariation = Math.sin(spawnX / 200) * 30;
    const hangarX = spawnX;
    const hangarY = groundLevel - terrainVariation + HANGAR_CONFIG.groundOffset;

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

    if (scene.add && scene.textures?.exists(HANGAR_CONFIG.markerTexture)) {
        const marker = scene.add.sprite(hangarX, hangarY + HANGAR_CONFIG.markerYOffset, HANGAR_CONFIG.markerTexture);
        marker.setDepth(FG_DEPTH_BASE);
        marker.setOrigin(0.5, 0.5);
        marker.setScale(HANGAR_CONFIG.markerScale);
        marker.setAlpha(0.85);
        hangar.marker = marker;
    }

    scene.hangar = hangar;
    return hangar;
}

function setupDefenseHangar(scene) {
    if (scene.hangar && scene.hangar.active) return scene.hangar;
    return spawnDefenseHangar(scene);
}
