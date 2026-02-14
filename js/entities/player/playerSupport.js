// ------------------------
// file: js/entities/player/playerSupport.js
// ------------------------

// Activates a smart bomb, clearing nearby threats and consuming one bomb charge.
function useSmartBomb(scene) {
    const { enemies, enemyProjectiles, audioManager } = scene;
    if (!enemies || !enemyProjectiles) return;
    if (gameState.smartBombs <= 0) return;
    gameState.smartBombs--;
    if (audioManager) audioManager.playSound('smartBomb');
    enemies.children.entries.forEach(enemy => {
        if (!enemy.active) return;
        createExplosion(scene, enemy.x, enemy.y);
        destroyEnemy(scene, enemy);
    });
    enemyProjectiles.clear(true);
    const reduceFlashes = typeof isFlashReductionEnabled === 'function' && isFlashReductionEnabled();
    const flash = scene.add.rectangle(
        scene.cameras.main.scrollX + CONFIG.width / 2,
        CONFIG.height / 2,
        CONFIG.width,
        CONFIG.height,
        0xffffff,
        reduceFlashes ? 0.4 : 0.8
    ).setScrollFactor(0).setDepth(FG_DEPTH_BASE + 90);
    scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy()
    });
}

// Performs a hyperspace jump to a random safe position with audiovisual feedback.
function useHyperspace(scene) {
    const { particleManager, audioManager } = scene;
    const player = getActivePlayer(scene);
    if (!player) return;
    player.x = Math.random() * CONFIG.worldWidth;
    player.y = 100 + Math.random() * (CONFIG.worldHeight - 200);
    if (particleManager) {
        particleManager.blackHoleExplosion(player.x, player.y);
    } else {
        createExplosion(scene, player.x, player.y, 0x00ffff);
    }
    if (audioManager) audioManager.playSound('hyperspace');
}

// Updates active player drone orbiting/targeting behavior and drone firing cadence.
function updateDrones(scene, time) {
    const { drones } = scene;
    const player = getActivePlayer(scene);
    if (!drones || !player) return;
    drones.children.entries.forEach((drone, index) => {
        const angle = (time * 0.002 + index * Math.PI * 2 / drones.children.entries.length) % (Math.PI * 2);
        drone.x = player.x + Math.cos(angle) * 60;
        drone.y = player.y + Math.sin(angle) * 40;
    });
}
