// ------------------------
// file: js/interiors/interiorRuntime.js
// ------------------------
// Shared runtime helpers for interior transition flows.

function logInteriorTransitionReadiness(scene, contextLabel) {
  if (!scene) return false;

  const missing = [];
  if (!scene.enemyProjectiles || !scene.enemyProjectiles.children) missing.push('enemyProjectiles');
  if (!scene.assaultTargets || !scene.assaultTargets.children) missing.push('assaultTargets');
  if (!scene.time || typeof scene.time.delayedCall !== 'function') missing.push('time.delayedCall');

  if (missing.length > 0) {
    console.warn(`[InteriorRuntime] ${contextLabel}: scene is missing expected groups/systems: ${missing.join(', ')}`);
  }

  return true;
}

function clearExteriorEntities(scene) {
  if (!scene) return;

  const clearGroup = (group) => {
    const entries = group?.children?.entries;
    if (!Array.isArray(entries)) return;
    entries.slice().forEach(entity => {
      if (entity && entity.active && typeof entity.destroy === 'function') {
        entity.destroy();
      }
    });
  };

  clearGroup(scene.enemies);
  clearGroup(scene.enemyProjectiles);
  clearGroup(scene.projectiles);
  clearGroup(scene.assaultTargets);
  clearGroup(scene.garrisonDefenders);
  clearGroup(scene.bosses);
  clearGroup(scene.battleships);
}

function fireInteriorTurret(scene, turret) {
  if (!scene || !turret || !turret.active) return;
  const projectileGroup = scene.enemyProjectiles;
  if (!projectileGroup || typeof projectileGroup.create !== 'function') return;

  const player = typeof getActivePlayer === 'function' ? getActivePlayer(scene) : null;
  if (!player || !player.active) return;

  const angle = Phaser.Math.Angle.Between(turret.x, turret.y, player.x, player.y);
  const speed = 180;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const proj = projectileGroup.create(turret.x, turret.y, 'enemyProjectile');
  if (!proj) return;

  proj.setDepth(FG_DEPTH_BASE + 1);
  if (proj.body) {
    proj.body.setAllowGravity(false);
  }
  proj.setVelocity(vx, vy);
  proj.damage = 1;

  if (turret.assaultRole === 'power_conduit') {
    proj.setTint(0x00ffff);
  } else if (turret.assaultRole === 'security_node') {
    proj.setTint(0xff00ff);
  }

  scene.time.delayedCall(4000, () => {
    if (proj && proj.active) proj.destroy();
  });
}

window.logInteriorTransitionReadiness = logInteriorTransitionReadiness;
window.clearExteriorEntities = clearExteriorEntities;
window.fireInteriorTurret = fireInteriorTurret;

if (typeof module !== 'undefined') {
  module.exports = {
    logInteriorTransitionReadiness,
    clearExteriorEntities,
    fireInteriorTurret
  };
}
