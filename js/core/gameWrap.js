// ------------------------
// File: js/core/gameWrap.js
// Wrap-around rendering helpers
// ------------------------

// Ghost sprites for entities that need to appear on both sides of the wrap boundary
function getGhostSprites(scene) {
    if (!scene.ghostSprites) {
        scene.ghostSprites = new Map();
    }
    return scene.ghostSprites;
}

function wrapValue(x, worldWidth) {
    x = x % worldWidth;
    if (x < 0) x += worldWidth;
    return x;
}

// Calculate shortest distance between two points in a wrapped world
function wrappedDistance(x1, x2, worldWidth) {
    const direct = x2 - x1;
    const wrapped = direct > 0 ? direct - worldWidth : direct + worldWidth;
    return Math.abs(direct) < Math.abs(wrapped) ? direct : wrapped;
}

// Get the render X position for an entity relative to camera
function getRenderX(entityX, cameraX, worldWidth) {
    // entityX should be canonical (0 to worldWidth)
    // cameraX is the camera scrollX
    const camCenter = cameraX + CONFIG.width / 2;
    
    // Find the position closest to camera center
    let renderX = entityX;
    const dist = wrappedDistance(camCenter, entityX, worldWidth);
    
    if (dist > 0) {
        // Entity is to the right (in wrapped terms)
        renderX = camCenter + dist;
    } else {
        // Entity is to the left (in wrapped terms)
        renderX = camCenter + dist;
    }
    
    return renderX;
}

// Create or update a ghost sprite for an entity near the boundary
function updateGhostSprite(scene, entity, ghostX) {
    const ghostSprites = getGhostSprites(scene);
    let ghost = ghostSprites.get(entity);
    
    if (!ghost) {
        // Create ghost sprite matching the original
        ghost = scene.add.sprite(ghostX, entity.y, entity.texture.key);
        ghost.setScale(entity.scaleX, entity.scaleY);
        ghost.setDepth(entity.depth);
        ghost.setAlpha(entity.alpha);
        ghost.setTint(entity.tintTopLeft);
        ghost.isGhost = true;
        ghostSprites.set(entity, ghost);
    }
    
    // Update ghost position and properties
    ghost.setPosition(ghostX, entity.y);
    ghost.setScale(entity.scaleX, entity.scaleY);
    ghost.setFlipX(entity.flipX);
    ghost.setFlipY(entity.flipY);
    ghost.setVisible(entity.visible && entity.active);
    ghost.setAlpha(entity.alpha);
    
    if (entity.anims && entity.anims.currentAnim) {
        ghost.anims.play(entity.anims.currentAnim.key, true);
        ghost.anims.setCurrentFrame(entity.anims.currentFrame);
    }
}

function removeGhostSprite(scene, entity) {
    const ghostSprites = getGhostSprites(scene);
    const ghost = ghostSprites.get(entity);
    if (ghost) {
        ghost.destroy();
        ghostSprites.delete(entity);
    }
}

// Main function to handle entity visibility across wrap boundaries
function updateEntityWrapping(scene) {
    const {
        player,
        veritech,
        pilot,
        enemies,
        projectiles,
        enemyProjectiles,
        powerUps,
        humans,
        drones,
        garrisonDefenders,
        bosses,
        battleships,
        explosions,
        assaultTargets,
        friendlies
    } = scene;
    const mainCam = scene.cameras.main;
    const scrollX = mainCam.scrollX;
    const camWidth = mainCam.width;
    const worldWidth = CONFIG.worldWidth;
    
    // Boundary threshold - how close to edge before we need a ghost
    const boundaryThreshold = camWidth;
    
    const processEntity = (entity) => {
        if (!entity || !entity.active) {
            removeGhostSprite(scene, entity);
            return;
        }
        
        // Get canonical position
        const canonicalX = wrapValue(entity.x, worldWidth);
        
        // Check if entity is near a boundary AND camera can see across that boundary
        const nearLeftEdge = canonicalX < boundaryThreshold;
        const nearRightEdge = canonicalX > worldWidth - boundaryThreshold;
        
        const cameraSeesLeftEdge = scrollX < boundaryThreshold;
        const cameraSeesRightEdge = scrollX + camWidth > worldWidth - boundaryThreshold;
        
        let needsGhost = false;
        let ghostX = canonicalX;
        
        if (nearRightEdge && cameraSeesLeftEdge) {
            // Entity is on right side, camera sees left side - ghost on left
            needsGhost = true;
            ghostX = canonicalX - worldWidth;
        } else if (nearLeftEdge && cameraSeesRightEdge) {
            // Entity is on left side, camera sees right side - ghost on right
            needsGhost = true;
            ghostX = canonicalX + worldWidth;
        }
        
        if (needsGhost) {
            updateGhostSprite(scene, entity, ghostX);
        } else {
            removeGhostSprite(scene, entity);
        }
        
        // Keep entity at canonical position
        entity.x = canonicalX;
    };
    
    const processGroup = (group) => {
        if (!group || !group.children || !group.children.entries) return;
        group.children.entries.forEach(processEntity);
    };
    
    // IMPORTANT: Process the active player first (standalone sprite, not in a group)
    if (player && player.active) {
        processEntity(player);
    }
    if (veritech && veritech.active && veritech !== player) {
        processEntity(veritech);
    }
    if (pilot && pilot.active && pilot !== player) {
        processEntity(pilot);
    }
    
    // Process all entity groups
    processGroup(enemies);
    processGroup(garrisonDefenders);
    processGroup(projectiles);
    processGroup(enemyProjectiles);
    processGroup(powerUps);
    processGroup(humans);
    processGroup(drones);
    processGroup(bosses);
    processGroup(battleships);
    processGroup(assaultTargets);
    processGroup(friendlies);
    
    if (explosions && explosions.children) {
        explosions.children.entries.forEach(processEntity);
    }
    
    // Clean up ghosts for destroyed entities
    const ghostSprites = getGhostSprites(scene);
    ghostSprites.forEach((ghost, entity) => {
        if (!entity.active) {
            ghost.destroy();
            ghostSprites.delete(entity);
        }
    });
}

// Clean up all ghost sprites
function destroyAllGhosts(scene) {
    const ghostSprites = getGhostSprites(scene);
    ghostSprites.forEach((ghost) => {
        if (ghost) ghost.destroy();
    });
    ghostSprites.clear();
}
