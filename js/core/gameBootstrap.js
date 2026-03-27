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

window.addEventListener('gamelayout-resize', () => {
    applyResponsiveResize({ force: true });
});

// Listen for fullscreen changes to force reset
document.addEventListener('fullscreenchange', () => {
    // Reset the cached dimensions when fullscreen changes
    lastResizeByLayout = {
        game: { width: 0, height: 0 },
        district: { width: 0, height: 0 },
        fullscreen: { width: 0, height: 0 }
    };

    // Wait for DOM to settle, then force resize
    setTimeout(() => {
        applyResponsiveResize({ force: true });
    }, 100);
});

// ------------------------
// Responsive Resize Helper
// ------------------------
let lastResizeByLayout = {
    game: { width: 0, height: 0 },
    district: { width: 0, height: 0 },
    fullscreen: { width: 0, height: 0 }
};

// Resizes the Phaser canvas for district, fullscreen, or standard layouts while avoiding redundant work.
function applyResponsiveResize(options = {}) {
    const { force = false } = options;

    // 1. Safety check
    if (!game || !game.scale || !game.canvas) return;

    // 2. District Mode Logic:
    if (
        window.DistrictLayoutManager &&
        window.DistrictLayoutManager.getCurrentLayout &&
        window.DistrictLayoutManager.getCurrentLayout() === 'district'
    ) {
        const container = document.getElementById('district-game-container');
        const districtCache = lastResizeByLayout.district;
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            if (!force && container.clientWidth === districtCache.width && container.clientHeight === districtCache.height) {
                return;
            }
            game.scale.resize(container.clientWidth, container.clientHeight);

            // Clear any inline pixel sizing from fullscreen/game layout.
            // District layout CSS should be the sole owner of canvas sizing.
            game.canvas.style.width = '';
            game.canvas.style.height = '';

            if (typeof resizeParallaxLayers === 'function') {
                resizeParallaxLayers(container.clientWidth, container.clientHeight);
            }
            game.scale.refresh();
            districtCache.width = container.clientWidth;
            districtCache.height = container.clientHeight;
        }
        return;
    }

    // 3. Fullscreen Gameplay Logic:
    if (document.body.classList.contains('fullscreen-active')) {
        const container = document.getElementById('game-container');
        const fullscreenCache = lastResizeByLayout.fullscreen;
        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
            if (!force && container.clientWidth === fullscreenCache.width && container.clientHeight === fullscreenCache.height) {
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
            fullscreenCache.width = container.clientWidth;
            fullscreenCache.height = container.clientHeight;
        }
        return;
    }

    // 4. Normal Game Mode Logic:
    const container = document.getElementById('game-container');
    const gameCache = lastResizeByLayout.game;
    if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        const targetWidth = Math.floor(container.clientWidth);
        const targetHeight = Math.floor(container.clientHeight);

        if (!force && targetWidth === gameCache.width && targetHeight === gameCache.height) {
            return;
        }
        console.log(`[ResponsiveResize] Normal mode - Updating game size to: ${targetWidth}x${targetHeight}`);

        // Clear any inline pixel styles left over from fullscreen mode.
        // In normal mode CSS keeps the canvas at 100% x 100% of #game-container.
        game.canvas.style.width = '';
        game.canvas.style.height = '';

        game.scale.resize(targetWidth, targetHeight);

        if (typeof resizeParallaxLayers === 'function') {
            resizeParallaxLayers(targetWidth, targetHeight);
        }

        game.scale.refresh();
        gameCache.width = targetWidth;
        gameCache.height = targetHeight;
    }
}

// ------------------------
// Touch controls wiring
// ------------------------

// Wires touch-button pointer events into shared virtual input flags and bomb activation behavior.
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
        ['pointerdown', 'touchstart', 'mousedown'].forEach(ev => {
            btn.addEventListener(ev, e => {
                e.preventDefault();
                setFlag(btn, true);
            });
        });
        ['pointerup', 'pointerleave', 'touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach(ev => {
            btn.addEventListener(ev, e => {
                e.preventDefault();
                setFlag(btn, false);
            });
        });
    });
})();
