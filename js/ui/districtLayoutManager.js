// ------------------------
// File: js/ui/districtLayoutManager.js
// ------------------------

const DistrictLayoutManager = (function() {
    let currentLayout = 'game'; // 'game' or 'district'
    let phaserCanvas = null;
    let originalParent = null;
    let selectedMode = 'classic';
    
    function init() {
        // Find the Phaser canvas once it's created
        const checkCanvas = setInterval(() => {
            phaserCanvas = document.querySelector('#game-container canvas, #district-game-container canvas');
            if (phaserCanvas) {
                originalParent = document.getElementById('game-container');
                clearInterval(checkCanvas);
                console.log('DistrictLayoutManager initialized');
            }
        }, 100);
    }
    
        function switchToDistrictLayout() {
    if (currentLayout === 'district') return;
    currentLayout = 'district';
    
    // Hide ALL game-related HTML elements
    const gameHud = document.getElementById('hud-container');
    const gameRadar = document.getElementById('radar-container');
    const gameControls = document.getElementById('controls-text');
    const touchControls = document.getElementById('touch-controls');
    const buildToggle = document.getElementById('build-toggle');
    
    if (gameHud) gameHud.style.display = 'none';
    if (gameRadar) gameRadar.style.display = 'none';
    if (gameControls) gameControls.style.display = 'none';
    if (touchControls) touchControls.style.display = 'none';
    if (buildToggle) buildToggle.style.display = 'none';
    
    // Show district-specific layout
    const gameLayout = document.getElementById('game-layout');
    const districtLayout = document.getElementById('district-layout');
    const districtCenter = document.getElementById('district-game-container');
    
    if (gameLayout) gameLayout.classList.add('hidden-for-district');
    if (districtLayout) districtLayout.classList.add('active');
    
    if (phaserCanvas && districtCenter) {
        districtCenter.appendChild(phaserCanvas);
        styleCanvasForDistrict();
        
        if (window.game && window.game.scale) {
            window.game.scale.resize(
                districtCenter.clientWidth, 
                districtCenter.clientHeight
            );
        }
    }

    updateDistrictPanels();
}
    


function switchToGameLayout() {
    if (currentLayout === 'game') return;
    currentLayout = 'game';
    
    // Show ALL game-related HTML elements
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
    
    // Hide district layout
    const gameLayout = document.getElementById('game-layout');
    const districtLayout = document.getElementById('district-layout');
    const gameContainer = document.getElementById('game-container');
    
    if (gameLayout) gameLayout.classList.remove('hidden-for-district');
    if (districtLayout) districtLayout.classList.remove('active');
    
    if (phaserCanvas && gameContainer) {
        gameContainer.appendChild(phaserCanvas);
        
        // Remove district styling
        phaserCanvas.style.width = '';
        phaserCanvas.style.height = '';
        phaserCanvas.style.objectFit = '';
        phaserCanvas.style.borderRadius = '';
        phaserCanvas.style.border = '';
        phaserCanvas.style.boxShadow = '';
    }
}
    
    function styleCanvasForDistrict() {
        if (!phaserCanvas) return;
        
        // CRITICAL FIX: Force the canvas to fill the panel without resizing its internal resolution
        phaserCanvas.style.width = '100%';
        phaserCanvas.style.height = '100%';
        phaserCanvas.style.objectFit = 'contain';
        
        phaserCanvas.style.borderRadius = '8px';
        phaserCanvas.style.border = '2px solid #0ea5e9';
        phaserCanvas.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.3)';
    }
    
    function removeDistrictStyling() {
        if (!phaserCanvas) return;
        
        // Remove overrides so Phaser's scaling takes back control
        phaserCanvas.style.width = '';
        phaserCanvas.style.height = '';
        phaserCanvas.style.objectFit = '';
        
        phaserCanvas.style.borderRadius = '';
        phaserCanvas.style.border = '';
        phaserCanvas.style.boxShadow = '';
    }
    
    function updateDistrictPanels() {
        updateElement('district-lives', gameState?.lives ?? 3);
        updateElement('district-bombs', gameState?.smartBombs ?? 3);
        updateElement('district-score', gameState?.score ?? 0);
        
        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        updateElement('district-credits', meta.credits);
        
        const loadout = window.metaProgression?.getLoadoutOptions?.() || {};
        const offenseEquipped = loadout.offense?.find(o => o.equipped)?.name || 'Standard';
        const defenseEquipped = loadout.defense?.find(o => o.equipped)?.name || 'Standard';
        updateElement('district-offense-slot', offenseEquipped);
        updateElement('district-defense-slot', defenseEquipped);
        
        updateModeButtons(selectedMode);
    }
    
    function updateMissionPanel(mission, district) {
        if (!mission) {
            updateElement('district-mission-city', 'No district selected');
            updateElement('district-mission-details', 'Click a district on the globe to begin');
            updateElement('district-urgency', '--');
            updateElement('district-reward-mult', '1.00x');
            updateElement('district-spawn-rate', '1.00x');
            
            const launchBtn = document.getElementById('district-launch-btn');
            if (launchBtn) {
                launchBtn.disabled = true;
                launchBtn.textContent = 'Select District to Launch';
            }
            return;
        }
        
        const { city, directives, latitude, longitude, seed } = mission;
        
        updateElement('district-mission-city', city || 'Unknown Region');
        updateElement('district-mission-details', 
            `Lat ${latitude?.toFixed(1) || '--'} · Lon ${longitude?.toFixed(1) || '--'}\nSeed: ${seed?.slice(0, 8) || '--'}`
        );
        
        updateElement('district-urgency', directives?.urgency?.toUpperCase() || 'NORMAL');
        updateElement('district-reward-mult', (directives?.rewardMultiplier || 1).toFixed(2) + 'x');
        updateElement('district-spawn-rate', (directives?.spawnMultiplier || 1).toFixed(2) + 'x');
        
        const launchBtn = document.getElementById('district-launch-btn');
        if (launchBtn) {
            launchBtn.disabled = false;
            const modeLabel = selectedMode === 'survival' ? 'Survival' : 'Wave';
            launchBtn.textContent = `Launch ${modeLabel} — ${district?.config?.name || city}`;
        }
        
        if (district) {
            updateDistrictStatus(district);
        }
    }
    
    function updateDistrictStatus(district) {
        const container = document.getElementById('district-node-status');
        if (!container) return;
        
        const statusLabel = district.state?.status === 'destroyed' 
            ? '🔴 DESTROYED'
            : district.state?.status === 'cleared'
                ? '🟢 STABILIZED'
                : '🟡 THREATENED';
        
        const timerText = district.state?.timer > 0 
            ? `Destabilization in: ${formatSeconds(district.state.timer)}`
            : 'No active timer';
        
        container.innerHTML = `
            <div class="district-stat-row">
                <span class="district-stat-label">Status</span>
                <span class="district-stat-value">${statusLabel}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Timer</span>
                <span class="district-stat-value">${timerText}</span>
            </div>
            <div class="district-stat-row">
                <span class="district-stat-label">Reward Focus</span>
                <span class="district-stat-value">${district.config?.reward || 'Standard'}</span>
            </div>
        `;
    }
    
    function updateModeButtons(mode) {
        selectedMode = mode;
        
        const waveBtn = document.getElementById('district-mode-wave');
        const survivalBtn = document.getElementById('district-mode-survival');
        
        if (waveBtn) {
            waveBtn.classList.toggle('active', mode === 'classic');
        }
        if (survivalBtn) {
            survivalBtn.classList.toggle('active', mode === 'survival');
        }
    }
    
    function selectMode(mode) {
        selectedMode = mode;
        updateModeButtons(mode);
        
        if (typeof missionPlanner !== 'undefined') {
            missionPlanner.setMode(mode);
        }
        
        const launchBtn = document.getElementById('district-launch-btn');
        if (launchBtn && !launchBtn.disabled) {
            const currentText = launchBtn.textContent;
            const modeLabel = mode === 'survival' ? 'Survival' : 'Wave';
            launchBtn.textContent = currentText.replace(/^Launch (Wave|Survival)/, `Launch ${modeLabel}`);
        }
    }
    
    function getSelectedMode() {
        return selectedMode;
    }
    
    function getCurrentLayout() {
        return currentLayout;
    }
    
    function updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
    
    function formatSeconds(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    return {
        switchToDistrictLayout,
        switchToGameLayout,
        updateDistrictPanels,
        updateMissionPanel,
        updateDistrictStatus,
        selectMode,
        getSelectedMode,
        getCurrentLayout,
        init
    };
})();

// Global functions for HTML onclick handlers
function selectDistrictMode(mode) {
    DistrictLayoutManager.selectMode(mode);
    
    if (window.game?.scene?.isActive?.(SCENE_KEYS.build)) {
        const buildScene = game.scene.getScene(SCENE_KEYS.build);
        if (buildScene?.selectMode) {
            buildScene.selectMode(mode);
        }
    }
}

function launchFromDistrictMap() {
    const mode = DistrictLayoutManager.getSelectedMode();
    
    if (window.game?.scene?.isActive?.(SCENE_KEYS.build)) {
        const buildScene = game.scene.getScene(SCENE_KEYS.build);
        if (buildScene?.launchMission) {
            buildScene.launchMission();
            return;
        }
    }
    
    if (window.startGame) {
        startGame(mode);
    }
}

function returnToGameFromDistrict() {
    closeBuildView();
}

function closeSettingsToGame() {
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'none';
    
    if (window.game?.scene) {
        const mainScene = game.scene.getScene(SCENE_KEYS.game);
        if (mainScene?.scene?.isPaused()) {
            mainScene.scene.resume();
        }
    }
}

window.DistrictLayoutManager = DistrictLayoutManager;
