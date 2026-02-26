VelocityY(250);
    debris.setDepth(FG_DEPTH_BASE - 1);

    scene.physics.add.overlap(scene.pilot, debris, () => {
      if (playerState.powerUps.invincibility <= 0) {
        damagePlayer(scene, hazard.damage);
      }
      debris.destroy();
    });

    scene.time.delayedCall(3000, () => {
      if (debris.active) debris.destroy();
    });
  }
}

function updateShieldBarrier(hazard, time) {
  if (!hazard.regenerates || !hazard.depleted) return;
  const elapsed = time - hazard.barrier.lastDamageTime;
  if (elapsed < hazard.regenDelay) return;

  hazard.barrier.shieldHealth = Math.min(
    hazard.barrier.maxShield,
    hazard.barrier.shieldHealth + 1
  );

  const alpha = 0.3 + 0.4 * (hazard.barrier.shieldHealth / hazard.barrier.maxShield);
  hazard.barrier.setAlpha(alpha);

  if (hazard.barrier.shieldHealth >= hazard.barrier.maxShield) {
    hazard.depleted = false;
    hazard.barrier.body.checkCollision.none = false;
  }
}

function damagePlayer(scene, amount) {
  if (typeof takePlayerDamage === 'function') {
    takePlayerDamage(scene, amount);
  } else if (typeof gameState !== 'undefined') {
    gameState.lives = Math.max(0, gameState.lives - amount);
  }
}

// Exports - make available globally
window.ACTIVE_HAZARDS = ACTIVE_HAZARDS;
window.initializeHazards = initializeHazards;
window.updateInteriorHazards = updateInteriorHazards;
window.clearInteriorHazards = clearInteriorHazards;
window.createHazard = createHazard;

if (typeof module !== 'undefined') {
  module.exports = { initializeHazards, updateInteriorHazards, clearInteriorHazards, createHazard, ACTIVE_HAZARDS };
}