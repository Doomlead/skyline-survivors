// ------------------------
// Enemy Graphics - All Enemy Sprites (Wrappers)
// ------------------------

function createOriginalEnemyGraphics(scene) {
    createLanderGraphics(scene);
    createMutantGraphics(scene);
    createDroneGraphics(scene);
    createBomberGraphics(scene);
    createSwarmerGraphics(scene);
    createPodGraphics(scene);
    createBaiterGraphics(scene);
}

/**
 * Handles the createNewEnemyGraphics routine and encapsulates its core gameplay logic.
 * Parameters: scene.
 * Returns: value defined by the surrounding game flow.
 */
function createNewEnemyGraphics(scene) {
    createKamikazeGraphics(scene);
    createTurretGraphics(scene);
    createShieldGraphics(scene);
    createSeekerGraphics(scene);
    createSpawnerGraphics(scene);
    createShielderGraphics(scene);
    createBouncerGraphics(scene);
    createSniperGraphics(scene);
    createSwarmLeaderGraphics(scene);
    createRegeneratorGraphics(scene);
}
