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
            }
        }, 100);
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
        const districtCenter = document.getElementById('district-game-container');

        if (gameLayout) gameLayout.style.display = 'none';
        if (districtLayout) districtLayout.style.display = 'flex';

        if (this.phaserCanvas && districtCenter) {
            districtCenter.appendChild(this.phaserCanvas);
            this.setCanvasLayoutClass('district');

            setTimeout(() => {
                if (window.game) {
                    window.game.scale.refresh();
                }
            }, 50);
        }

        const hud = document.getElementById('hud-container');
        if (hud) hud.style.display = 'none';
        const buildToggle = document.getElementById('build-toggle');
        if (buildToggle) buildToggle.style.display = 'none';
    }

    switchToGameLayout() {
        if (this.currentLayout === 'game') return;
        this.currentLayout = 'game';
        this.setBodyLayoutMode('game');

        const gameHud = document.getElementById('hud-container');
        const gameRadar = document.getElementById('radar-container');
        const gameControls = document.getElementById('controls-text');
        const touchControls = document.getElementById('touch-controls');
        const buildToggle = document.getElementById('build-toggle');

        if (gameHud) gameHud.style.display = 'block';
        if (gameRadar) gameRadar.style.display = 'block';
        if (gameControls) gameControls.style.display = 'block';
        if (touchControls) touchControls.style.display = 'flex';
        if (buildToggle) buildToggle.style.display = 'block';

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

            if (window.game && window.game.scale) {
                const resizeToGameLayout = () => {
                    const responsive = typeof getResponsiveScale === 'function'
                        ? getResponsiveScale()
                        : { width: CONFIG.width, height: CONFIG.height };
                    const width = responsive.width || CONFIG.width;
                    const height = responsive.height || CONFIG.height;

                    console.log('[GameLayoutManager] Resizing canvas for game layout');
                    window.game.scale.resize(width, height);
                    window.game.scale.refresh();
                    this.phaserCanvas.style.width = `${width}px`;
                    this.phaserCanvas.style.height = `${height}px`;
                };

                requestAnimationFrame(() => {
                    requestAnimationFrame(resizeToGameLayout);
                });
            }
        }
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
