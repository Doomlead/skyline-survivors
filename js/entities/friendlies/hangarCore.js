// ------------------------
// Hangar Core - Defense Map Extraction Hub
// ------------------------

const HANGAR_CONFIG = {
    texture: 'hangar',
    scale: 1.5,
    groundOffset: 6
};

function getHangarGroundY(scene, x) {
    const groundLevel = scene?.groundLevel || CONFIG.worldHeight - 80;
    const terrainVariation = Math.sin(x / 200) * 30;
    return groundLevel - terrainVariation;
}

function isDefenseMission() {
    return gameState.mode !== 'assault'
        && gameState.mode !== 'mothership'
        && gameState.mode !== 'survival';
}

function spawnDefenseHangar(scene) {
    if (!scene || !scene.friendlies || !isDefenseMission()) return null;

    const spawnX = scene.veritech ? scene.veritech.x : CONFIG.worldWidth * 0.5;
    const spawnY = scene.veritech ? scene.veritech.y : null;
    const terrainVariation = Math.sin(spawnX / 200) * 30;
    const groundY = getHangarGroundY(scene, spawnX);
    const hangarX = spawnX;
    const hangarY = spawnY !== null
        ? spawnY
        : groundY + HANGAR_CONFIG.groundOffset;

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

    const beaconBeamHeight = Math.max(40, hangarY - groundY - 12);
    const beaconBeam = scene.add.rectangle(hangarX, hangarY - beaconBeamHeight / 2, 14, beaconBeamHeight, 0x38bdf8, 0.18);
    beaconBeam.setOrigin(0.5, 0.5);
    beaconBeam.setDepth(FG_DEPTH_BASE);
    const beaconPad = scene.add.rectangle(hangarX, groundY, 130, 14, 0x22d3ee, 0.5);
    beaconPad.setOrigin(0.5, 1);
    beaconPad.setDepth(FG_DEPTH_BASE + 1);
    const beaconLabel = scene.add.text(hangarX, groundY - 16, 'HANGAR DROP ZONE', {
        fontSize: '10px',
        fontFamily: 'Orbitron',
        color: '#38bdf8',
        stroke: '#0f172a',
        strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(FG_DEPTH_BASE + 2);

    hangar.beaconBeam = beaconBeam;
    hangar.beaconPad = beaconPad;
    hangar.beaconLabel = beaconLabel;

    scene.hangar = hangar;
    return hangar;
}

function setupDefenseHangar(scene) {
    if (scene.hangar && scene.hangar.active) return scene.hangar;
    return spawnDefenseHangar(scene);
}
