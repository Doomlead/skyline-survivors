// ------------------------
// File: js/core/gameWrap.js
// Wrap-around rendering helpers
// ------------------------

// Ghost sprites for entities that need to appear on both sides of the wrap boundary
// Returns the per-scene ghost-sprite registry used for wrap-around visual duplication.
function getGhostSprites(scene) {
    if (!scene.ghostSprites) {
        scene.ghostSprites = new Map();
    }
    return scene.ghostSprites;
}

// Normalizes an x-coordinate into the wrapped world range [0, worldWidth).
function wrapValue(x, worldWidth) {
    x = x % worldWidth;
    if (x < 0) x += worldWidth;
    return x;
}

// Calculate shortest distance between two points in a wrapped world
// Computes the shortest signed horizontal distance between two x values in a wrapped world.
function wrappedDistance(x1, x2, worldWidth) {
    const direct = x2 - x1;
    const wrapped = direct > 0 ? direct - worldWidth : direct + worldWidth;
    return Math.abs(direct) < Math.abs(wrapped) ? direct : wrapped;
}

// Get the render X position for an entity relative to camera
// Computes the nearest render-space x-position for an entity relative to camera center with wrap logic.
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
// Creates or updates an entity ghost sprite so objects remain visible across world boundaries.
function updateGhostSprite(scene, entity, ghostX) {
    const ghostSprites = getGhostSprites(scene);
    let ghost = ghostSprites.get(entity);
    
    if (!ghost) {
        // Create ghost sprite matching the original
        ghost = scene.add.sprite(ghostX, entity.y, entity.texture.key);
        ghost.setOrigin(entity.originX, entity.originY);
        ghost.setScale(entity.scaleX, entity.scaleY);
        ghost.setDepth(entity.depth);
        ghost.setAlpha(entity.alpha);
        ghost.setTint(entity.tintTopLeft);
        ghost.isGhost = true;
        ghostSprites.set(entity, ghost);
    }
    
    // Update ghost position and properties
    ghost.setPosition(ghostX, entity.y);
    ghost.setOrigin(entity.originX, entity.originY);
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

// Destroys and unregisters a ghost sprite associated with the provided source entity.
function removeGhostSprite(scene, entity) {
    const ghostSprites = getGhostSprites(scene);
    const ghost = ghostSprites.get(entity);
    if (ghost) {
        ghost.destroy();
        ghostSprites.delete(entity);
    }
}

// Main function to handle entity visibility across wrap boundaries
// Canonicalizes entity x-positions and maintains ghost sprites for cross-boundary visibility.
function updateEntityWrapping(scene) {
    const {
        player,
        aegis,
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
    
    /**
     * Handles the processEntity routine and encapsulates its core gameplay logic.
     * Parameters: entity.
     * Returns: value defined by the surrounding game flow.
     */
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
    
    /**
     * Handles the processGroup routine and encapsulates its core gameplay logic.
     * Parameters: group.
     * Returns: value defined by the surrounding game flow.
     */
    const processGroup = (group) => {
        if (!group || !group.children || !group.children.entries) return;
        group.children.entries.forEach(processEntity);
    };
    
    // IMPORTANT: Process the active player first (standalone sprite, not in a group)
    if (player && player.active) {
        processEntity(player);
    }
    if (aegis && aegis.active && aegis !== player) {
        processEntity(aegis);
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
// Destroys all ghost sprites tracked for a scene during teardown or reset.
function destroyAllGhosts(scene) {
    const ghostSprites = getGhostSprites(scene);
    ghostSprites.forEach((ghost) => {
        if (ghost) ghost.destroy();
    });
    ghostSprites.clear();
}
