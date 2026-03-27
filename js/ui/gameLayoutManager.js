// ------------------------
// File: js/ui/gameLayoutManager.js
// ------------------------

class GameLayoutManager {
    constructor() {
        this.currentLayout = 'game';
        this.phaserCanvas = null;
        this.originalParent = null;
    }

    setBodyLayoutMode(mode) {
        document.body.classList.remove('mode-game', 'mode-district');
        document.body.classList.add(mode === 'district' ? 'mode-district' : 'mode-game');
    }

    setCanvasLayoutClass(layout) {
        if (!this.phaserCanvas) return;
        this.phaserCanvas.classList.remove('phaser-game-canvas', 'phaser-district-canvas');
        this.phaserCanvas.classList.add(layout === 'district' ? 'phaser-district-canvas' : 'phaser-game-canvas');
    }

    init() {
        this.setBodyLayoutMode(this.currentLayout);

        const checkCanvas = setInterval(() => {
            this.phaserCanvas = window.game?.canvas || document.querySelector('#game-container canvas');
            if (this.phaserCanvas) {
                this.originalParent = document.getElementById('game-container');
                this.setCanvasLayoutClass('game');
                clearInterval(checkCanvas);
                console.log('GameLayoutManager initialized');
                this.resizeToContainer();
            }
        }, 100);

        window.addEventListener('resize', () => {
            if (this.currentLayout === 'game') {
                this.resizeToContainer();
            }
        });
    }

    switchToDistrictLayout() {
        if (this.currentLayout === 'district') return;
        this.currentLayout = 'district';
        this.setBodyLayoutMode('district');

        if (window.FullscreenController?.forceExitFullscreen) {
            window.FullscreenController.forceExitFullscreen();
        }

        const gameLayout = document.getElementById('game-layout');
        const districtLayout = document.getElementById('district-layout');
        if (gameLayout) gameLayout.style.display = 'none';
        if (districtLayout) districtLayout.style.display = 'flex';

        const hud = document.getElementById('hud-container');
        if (hud) hud.style.display = 'none';
        const buildToggle = document.getElementById('build-toggle');
        if (buildToggle) buildToggle.style.display = 'none';
    }

    switchToGameLayout() {
        if (this.currentLayout === 'game') return;
        this.currentLayout = 'game';
        this.setBodyLayoutMode('game');

        // Restore primary HUD/build controls; permanently hidden items remain CSS-driven
        const gameHud = document.getElementById('hud-container');
        const buildToggle = document.getElementById('build-toggle');
        if (gameHud) gameHud.style.display = '';
        if (buildToggle) buildToggle.style.display = '';

        const gameLayout = document.getElementById('game-layout');
        const districtLayout = document.getElementById('district-layout');
        const gameContainer = document.getElementById('game-container');

        if (gameLayout) {
            gameLayout.style.display = 'flex';
            gameLayout.classList.remove('hidden-for-district');
        }
        if (districtLayout) {
            districtLayout.style.display = 'none';
            districtLayout.classList.remove('active');
        }

        if (this.phaserCanvas && gameContainer) {
            gameContainer.appendChild(this.phaserCanvas);
            this.setCanvasLayoutClass('game');
            this.resizeToContainer();
        }
    }

    resizeToContainer() {
        if (!window.game || !window.game.scale) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = document.getElementById('game-container');
                if (!container) return;
                const w = Math.floor(container.clientWidth) || window.innerWidth;
                const h = Math.floor(container.clientHeight) || window.innerHeight;
                if (w < 10 || h < 10) return;

                console.log('[GameLayoutManager] Resizing Phaser to container', w, h);
                window.game.scale.resize(w, h);
                window.game.scale.refresh();

                if (this.phaserCanvas) {
                    this.phaserCanvas.style.width = '100%';
                    this.phaserCanvas.style.height = '100%';
                }

                window.dispatchEvent(new CustomEvent('gamelayout-resize', { detail: { width: w, height: h } }));
            });
        });
    }

    resizeToContainer() {
        if (!window.game || !window.game.scale) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = document.getElementById('game-container');
                if (!container) return;
                const w = Math.floor(container.clientWidth) || window.innerWidth;
                const h = Math.floor(container.clientHeight) || window.innerHeight;
                if (w < 10 || h < 10) return;

                console.log('[GameLayoutManager] Resizing Phaser to container', w, h);
                window.game.scale.resize(w, h);
                window.game.scale.refresh();

                // Keep sizing ownership in CSS to avoid cross-layout coupling.
                if (this.phaserCanvas) {
                    this.phaserCanvas.style.width = '';
                    this.phaserCanvas.style.height = '';
                }

                window.dispatchEvent(new CustomEvent('gamelayout-resize', { detail: { width: w, height: h } }));
            });
        });
    }

    getCurrentLayout() {
        return this.currentLayout;
    }
}

window.GameLayoutManager = new GameLayoutManager();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GameLayoutManager.init());
} else {
    window.GameLayoutManager.init();
}
