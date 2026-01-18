// ------------------------
// file: js/entities/player/playerCollisions.js
// ------------------------

function playerHitEnemy(playerSprite, enemy) {
    const audioManager = this.audioManager;
    if (playerState.powerUps.invincibility > 0) {
        destroyEnemy(this, enemy);
        return;
    }
    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        destroyEnemy(this, enemy);
        screenShake(this, 10, 200);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        screenShake(this, 15, 300);
        playerDie(this);
    }
}

function playerHitProjectile(playerSprite, projectile) {
    const audioManager = this.audioManager;
    if (playerState.powerUps.invincibility > 0) {
        projectile.destroy();
        return;
    }
    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        projectile.destroy();
        screenShake(this, 8, 150);
        if (audioManager) audioManager.playSound('hitPlayer');
    } else {
        projectile.destroy();
        screenShake(this, 12, 250);
        playerDie(this);
    }
}

function droneHitEnemy(drone, enemy) {
    if (!drone || !drone.active) return;
    createExplosion(this, drone.x, drone.y, 0x22d3ee);
    drone.destroy();
    playerState.powerUps.drone = Math.max((playerState.powerUps.drone || 0) - 1, 0);
}

function droneHitProjectile(drone, projectile) {
    if (!drone || !drone.active) return;
    if (projectile && projectile.active) {
        projectile.destroy();
    }
    createExplosion(this, drone.x, drone.y, 0x22d3ee);
    drone.destroy();
    playerState.powerUps.drone = Math.max((playerState.powerUps.drone || 0) - 1, 0);
}
