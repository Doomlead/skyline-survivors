// ------------------------
// File: js/core/gameBootstrap.js
// Responsive resize + touch controls wiring
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
            container.style.height = '100%';
            if (!force && container.clientWidth === lastResizeWidth && container.clientHeight === lastResizeHeight) {
                return;
            }
            console.log(`[ResponsiveResize] Updating game size to: ${container.clientWidth}x${container.clientHeight}`);
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
    const container = document.getElementById('game-container');
    const containerWidth = container?.clientWidth || window.innerWidth;
    let containerHeight = container?.clientHeight || 0;
    const aspectRatio = CONFIG.height / CONFIG.width;

    if (containerWidth > 0) {
        if (!containerHeight || containerHeight < 50) {
            containerHeight = Math.round(containerWidth * aspectRatio);
            if (container) {
                container.style.height = `${containerHeight}px`;
            }
        }

        if (!force && containerWidth === lastResizeWidth && containerHeight === lastResizeHeight) {
            return;
        }

        console.log(`[ResponsiveResize] Updating game size to: ${containerWidth}x${containerHeight}`);
        game.scale.resize(containerWidth, containerHeight);
        game.canvas.style.width = `${containerWidth}px`;
        game.canvas.style.height = `${containerHeight}px`;
        if (typeof resizeParallaxLayers === 'function') {
            resizeParallaxLayers(containerWidth, containerHeight);
        }
        game.scale.refresh();
        lastResizeWidth = containerWidth;
        lastResizeHeight = containerHeight;
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
