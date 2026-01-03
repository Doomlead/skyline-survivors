// ========================
// PlayerCamera.js
// Handles player camera wrapping in the continuous world
// ========================

class PlayerCamera {
    constructor(worldWidth) {
        this.worldWidth = worldWidth;
    }

    /**
     * Update camera position with wrapping
     */
    update(camera, activePlayer) {
        if (!camera || !activePlayer) return;

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
    module.exports = PlayerCamera;
}
