// ========================
// WrapSystem.js
// Handles wrap-around rendering for continuous world
// ========================

class WrapSystem {
    constructor(worldWidth) {
        this.worldWidth = worldWidth;
        this.ghostSprites = new Map();
    }

    /**
     * Wrap a value to stay within world bounds
     */
    wrapValue(x) {
        x = x % this.worldWidth;
        if (x < 0) x += this.worldWidth;
        return x;
    }

    /**
     * Calculate shortest distance between two points in wrapped world
     */
    wrappedDistance(x1, x2) {
        const direct = x2 - x1;
        const wrapped = direct > 0 ? direct - this.worldWidth : direct + this.worldWidth;
        return Math.abs(direct) < Math.abs(wrapped) ? direct : wrapped;
    }

    /**
     * Get render X position for entity relative to camera
     */
    getRenderX(entityX, cameraX, camWidth) {
        const camCenter = cameraX + camWidth / 2;
        const dist = this.wrappedDistance(camCenter, entityX);
        return camCenter + dist;
    }

    /**
     * Create or update ghost sprite for entity near boundary
     */
    updateGhostSprite(scene, entity, ghostX) {
        let ghost = this.ghostSprites.get(entity);
        
        if (!ghost) {
            ghost = scene.add.sprite(ghostX, entity.y, entity.texture.key);
            ghost.setScale(entity.scaleX, entity.scaleY);
            ghost.setDepth(entity.depth);
            ghost.setAlpha(entity.alpha);
            ghost.setTint(entity.tintTopLeft);
            ghost.isGhost = true;
            this.ghostSprites.set(entity, ghost);
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

    /**
     * Remove ghost sprite for entity
     */
    removeGhostSprite(entity) {
        const ghost = this.ghostSprites.get(entity);
        if (ghost) {
            ghost.destroy();
            this.ghostSprites.delete(entity);
        }
    }

    /**
     * Main update loop - handles entity visibility across wrap boundaries
     */
    updateEntityWrapping(scene) {
        const {
            player, veritech, pilot, enemies, projectiles, enemyProjectiles,
            powerUps, humans, drones, garrisonDefenders, bosses, battleships,
            explosions, assaultTargets
        } = scene;

        const mainCam = scene.cameras.main;
        const scrollX = mainCam.scrollX;
        const camWidth = mainCam.width;
        const boundaryThreshold = camWidth;
        
        const processEntity = (entity) => {
            if (!entity || !entity.active) {
                this.removeGhostSprite(entity);
                return;
            }
            
            // Get canonical position
            const canonicalX = this.wrapValue(entity.x);
            
            // Check if entity is near boundary AND camera can see across that boundary
            const nearLeftEdge = canonicalX < boundaryThreshold;
            const nearRightEdge = canonicalX > this.worldWidth - boundaryThreshold;
            
            const cameraSeesLeftEdge = scrollX < boundaryThreshold;
            const cameraSeesRightEdge = scrollX + camWidth > this.worldWidth - boundaryThreshold;
            
            let needsGhost = false;
            let ghostX = canonicalX;
            
            if (nearRightEdge && cameraSeesLeftEdge) {
                needsGhost = true;
                ghostX = canonicalX - this.worldWidth;
            } else if (nearLeftEdge && cameraSeesRightEdge) {
                needsGhost = true;
                ghostX = canonicalX + this.worldWidth;
            }
            
            if (needsGhost) {
                this.updateGhostSprite(scene, entity, ghostX);
            } else {
                this.removeGhostSprite(entity);
            }
            
            // Keep entity at canonical position
            entity.x = canonicalX;
        };
        
        const processGroup = (group) => {
            if (!group || !group.children || !group.children.entries) return;
            group.children.entries.forEach(processEntity);
        };
        
        // Process active player first
        if (player && player.active) processEntity(player);
        if (veritech && veritech.active && veritech !== player) processEntity(veritech);
        if (pilot && pilot.active && pilot !== player) processEntity(pilot);
        
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
        
        if (explosions && explosions.children) {
            explosions.children.entries.forEach(processEntity);
        }
        
        // Clean up ghosts for destroyed entities
        this.ghostSprites.forEach((ghost, entity) => {
            if (!entity.active) {
                ghost.destroy();
                this.ghostSprites.delete(entity);
            }
        });
    }

    /**
     * Clean up all ghost sprites
     */
    destroyAllGhosts() {
        this.ghostSprites.forEach((ghost) => {
            if (ghost) ghost.destroy();
        });
        this.ghostSprites.clear();
    }

    /**
     * Update camera position with wrapping
     */
    updateCameraPosition(camera, activePlayer) {
        let desiredScrollX = activePlayer.x - camera.width / 2;
        const maxScroll = this.worldWidth - camera.width;
        
        // Handle wrap-around camera positioning
        if (desiredScrollX < 0) {
            desiredScrollX = this.worldWidth + desiredScrollX;
        } else if (desiredScrollX > maxScroll) {
            desiredScrollX = desiredScrollX - this.worldWidth;
        }
        
        camera.scrollX = desiredScrollX;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WrapSystem;
}