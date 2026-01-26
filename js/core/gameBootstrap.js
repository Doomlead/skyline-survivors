// ------------------------
// File: js/core/gameBootstrap.js
// ------------------------

// Trigger initial resize
applyResponsiveResize();

// Event listeners
window.addEventListener('resize', () => {
    applyResponsiveResize();
});
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        applyResponsiveResize();
    }, 100);
});

// Listen for fullscreen changes to force reset
document.addEventListener('fullscreenchange', () => {
    // Reset the cached dimensions when fullscreen changes
    lastResizeWidth = 0;
    lastResizeHeight = 0;
    
    // Wait for DOM to settle, then force resize
    setTimeout(() => {
        applyResponsiveResize({ force: true });
    }, 100);
});

// ------------------------
// Responsive Resize Helper
// ------------------------
let lastResizeWidth = 0;
let lastResizeHeight = 0;

function applyResponsiveResize(options = {}) {
    const { force = false } = options;
    
    // 1. Safety check
    if (!game || !game.scale || !game.canvas) return;

    // 2. District Mode Logic:
    // If we are in District Mode, simply force the canvas to fill the container.
    // This allows the globe to use the full resolution of your new larger container.
    if (window.DistrictLayoutManager && 
        window.DistrictLayoutManager.getCurrentLayout && 
        window.DistrictLayoutManager.getCurrentLayout() === 'district') {
        
        const container = document.getElementById('district-game-container');
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            if (!force && container.clientWidth === lastResizeWidth && container.clientHeight === lastResizeHeight) {
                return;
            }
            // Resize Phaser to match the container exactly
            game.scale.resize(container.clientWidth, container.clientHeight);
            if (typeof resizeParallaxLayers === 'function') {
                resizeParallaxLayers(container.clientWidth, container.clientHeight);
            }
            game.scale.refresh();
            lastResizeWidth = container.clientWidth;
            lastResizeHeight = container.clientHeight;
        }
        return; 
    }

    // 3. Fullscreen Gameplay Logic:
    if (document.body.classList.contains('fullscreen-active')) {
        const container = document.getElementById('game-container');
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            if (!force && container.clientWidth === lastResizeWidth && container.clientHeight === lastResizeHeight) {
                return;
            }
            console.log(`[ResponsiveResize] Fullscreen - Updating game size to: ${container.clientWidth}x${container.clientHeight}`);
            game.scale.resize(container.clientWidth, container.clientHeight);
            game.canvas.style.width = `${container.clientWidth}px`;
            game.canvas.style.height = `${container.clientHeight}px`;
            if (typeof resizeParallaxLayers === 'function') {
                resizeParallaxLayers(container.clientWidth, container.clientHeight);
            }
            game.scale.refresh();
            lastResizeWidth = container.clientWidth;
            lastResizeHeight = container.clientHeight;
        }
        return;
    }

    // 4. Normal Game Mode Logic:
    const { width, height } = getResponsiveScale();
    
    // Only resize if the dimensions are valid
    if (width > 0 && height > 0) {
        if (!force && width === lastResizeWidth && height === lastResizeHeight) {
            return;
        }
        console.log(`[ResponsiveResize] Normal mode - Updating game size to: ${width}x${height}`);
        
        // Clear any inline styles that might have been set during fullscreen
        game.canvas.style.width = '';
        game.canvas.style.height = '';
        
        // Force Phaser to use these dimensions
        game.scale.resize(width, height);
        
        // Set CSS to match
        game.canvas.style.width = `${width}px`;
        game.canvas.style.height = `${height}px`;
        
        if (typeof resizeParallaxLayers === 'function') {
            resizeParallaxLayers(width, height);
        }
        
        // Refresh the scale manager internals
        game.scale.refresh();
        lastResizeWidth = width;
        lastResizeHeight = height;
    }
}

// ------------------------
// Touch controls wiring
// ------------------------

(function setupTouchControls() {
    const buttons = document.querySelectorAll('#touch-controls .tc-btn');
    function setFlag(btn, isDown) {
        const dir = btn.getAttribute('data-dir');
        const action = btn.getAttribute('data-action');
        if (dir) {
            window.virtualInput[dir] = isDown;
        } else if (action === 'fire') {
            window.virtualInput.fire = isDown;
        } else if (action === 'bomb' && isDown) {
            const scene = game.scene.getScene(SCENE_KEYS.game);
            if (scene && scene.scene.isActive()) useSmartBomb(scene);
        }
    }
    buttons.forEach(btn => {
        ['pointerdown','touchstart','mousedown'].forEach(ev => {
            btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, true); });
        });
        ['pointerup','pointerleave','touchend','touchcancel','mouseup','mouseleave'].forEach(ev => {
            btn.addEventListener(ev, e => { e.preventDefault(); setFlag(btn, false); });
        });
    });
})();