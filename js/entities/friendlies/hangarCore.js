// ------------------------
// Hangar Core - Defense Map Extraction Hub
// ------------------------

const HANGAR_CONFIG = {
    texture: 'hangar',
    scale: 1.5,
    groundOffset: 6
};
const LANDING_ZONE_CONFIG = {
    texture: 'landingZone',
    scale: 1.4,
    groundOffset: 2,
    baseAlpha: 0.85
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

    const landingZoneY = groundLevel - terrainVariation + LANDING_ZONE_CONFIG.groundOffset;
    const landingZone = scene.friendlies.create(hangarX, landingZoneY, LANDING_ZONE_CONFIG.texture);
    landingZone.setOrigin(0.5, 1);
    landingZone.setDepth(FG_DEPTH_BASE);
    landingZone.setScale(LANDING_ZONE_CONFIG.scale);
    landingZone.setAlpha(LANDING_ZONE_CONFIG.baseAlpha);
    landingZone.setImmovable(true);
    if (landingZone.body) {
        landingZone.body.setAllowGravity(false);
        landingZone.body.setVelocity(0, 0);
    }
    landingZone.isLandingZone = true;
    landingZone.baseY = landingZoneY;
    landingZone.blinkOffset = Math.random() * Math.PI * 2;
    hangar.landingZone = landingZone;

    scene.hangar = hangar;
    return hangar;
}

function setupDefenseHangar(scene) {
    if (scene.hangar && scene.hangar.active) return scene.hangar;
    return spawnDefenseHangar(scene);
}
