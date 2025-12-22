// ============================================
// District Layout Manager
// Handles switching between game and district map layouts
// WITH COMPREHENSIVE DEBUGGING
// ============================================

const DistrictLayoutManager = (function() {
    let currentLayout = 'game'; // 'game' or 'district'
    let phaserCanvas = null;
    let originalParent = null;
    let selectedMode = 'classic';
    let scaleListener = null;
    let lastKnownScale = null;
    
    function init() {
        // Find the Phaser canvas once it's created
        const checkCanvas = setInterval(() => {
            phaserCanvas = document.querySelector('#game-container canvas, #district-game-container canvas');
            if (phaserCanvas) {
                originalParent = document.getElementById('game-container');
                clearInterval(checkCanvas);
                console.log('=== CANVAS FOUND ===');
                console.log('Canvas dimensions:', phaserCanvas.width, 'x', phaserCanvas.height);
                console.log('Canvas style:', phaserCanvas.style.width, 'x', phaserCanvas.style.height);
                console.log('Game scale dimensions:', window.game?.scale?.width, 'x', window.game?.scale?.height);
                console.log('CONFIG dimensions:', CONFIG.width, 'x', CONFIG.height);
            }
        }, 100);
    }
    
    function switchToDistrictLayout() {
        console.log('=== SWITCHING TO DISTRICT LAYOUT ===');
        if (currentLayout === 'district') {
            console.log('Already in district layout, skipping');
            return;
        }
        currentLayout = 'district';
        
        const gameLayout = document.getElementById('game-layout');
        const districtLayout = document.getElementById('district-layout');
        const districtCenter = document.getElementById('district-game-container');
        
        // Hide game layout, show district layout
        if (gameLayout) gameLayout.classList.add('hidden-for-district');
        if (districtLayout) districtLayout.classList.add('active');
        
        // Move canvas WITHOUT triggering resize
        if (phaserCanvas && districtCenter) {
            districtCenter.appendChild(phaserCanvas);
            styleCanvasForDistrict();
            
            // ADDED: Explicitly prevent Phaser from auto-resizing
            if (window.game && window.game.scale) {
                // Store current dimensions before any potential resize
                const currentWidth = window.game.scale.width;
                const currentHeight = window.game.scale.height;
                
                // Use requestAnimationFrame to check after layout settles
                requestAnimationFrame(() => {
                    if (window.game.scale.width !== currentWidth || 
                        window.game.scale.height !== currentHeight) {
                        console.log('Resize detected after layout switch, reverting...');
                        window.game.scale.resize(currentWidth, currentHeight);
                        syncCanvasStyles(currentWidth, currentHeight);
                    }
                });
            }
        }
        
        // Monitor Phaser scale events while in district view to prevent unexpected shrink
        attachScaleMonitor();
        updateDistrictPanels();
    }
    
    function switchToGameLayout() {
        console.log('=== SWITCHING TO GAME LAYOUT ===');
        if (currentLayout === 'game') return;
        currentLayout = 'game';
        detachScaleMonitor();
        
        const gameLayout = document.getElementById('game-layout');
        const districtLayout = document.getElementById('district-layout');
        const gameContainer = document.getElementById('game-container');
        
        if (gameLayout) gameLayout.classList.remove('hidden-for-district');
        if (districtLayout) districtLayout.classList.remove('active');
        
        if (phaserCanvas && gameContainer) {
            gameContainer.appendChild(phaserCanvas);
            removeDistrictStyling();
        }
        
        console.log('Switched back to game layout');
    }
    
    function styleCanvasForDistrict() {
        if (!phaserCanvas) {
            console.warn('styleCanvasForDistrict: No canvas found!');
            return;
        }
        
        console.log('=== STYLING CANVAS FOR DISTRICT ===');
        console.log('Canvas dimensions BEFORE styling:', phaserCanvas.width, 'x', phaserCanvas.height);
        console.log('Canvas style BEFORE:', phaserCanvas.style.width, 'x', phaserCanvas.style.height);
        
        // Just add border/shadow styling, don't change size or scale
        phaserCanvas.style.borderRadius = '8px';
        phaserCanvas.style.border = '2px solid #0ea5e9';
        phaserCanvas.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.3)';
        
        console.log('Canvas dimensions AFTER styling:', phaserCanvas.width, 'x', phaserCanvas.height);
        console.log('Canvas style AFTER:', phaserCanvas.style.width, 'x', phaserCanvas.style.height);
        console.log('Styling complete - NO RESIZE performed');
    }
    
    function syncCanvasStyles(width, height) {
        if (!phaserCanvas) return;
        phaserCanvas.style.width = `${width}px`;
        phaserCanvas.style.height = `${height}px`;
        console.log('[DistrictLayout] Synced canvas styles to', width, 'x', height);
    }
    
    function removeDistrictStyling() {
        if (!phaserCanvas) return;
        
        phaserCanvas.style.borderRadius = '';
        phaserCanvas.style.border = '';
        phaserCanvas.style.boxShadow = '';
        
        console.log('District styling removed');
    }
    
    function resizeCanvasForDistrict() {
        console.warn('⚠️ resizeCanvasForDistrict called but is DISABLED to prevent globe shrinking');
        console.log('Current canvas size:', phaserCanvas?.width, 'x', phaserCanvas?.height);
        console.log('Current game scale:', window.game?.scale?.width, 'x', window.game?.scale?.height);
    }
    
    function resizeCanvasForGame() {
        console.warn('⚠️ resizeCanvasForGame called but is DISABLED');
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
    
    function attachScaleMonitor() {
        if (!window.game?.scale) return;
        if (scaleListener) {
            window.game.scale.off('resize', scaleListener);
            scaleListener = null;
        }
        
        lastKnownScale = {
            width: window.game.scale.width,
            height: window.game.scale.height
        };
        console.log('[DistrictLayout] Captured scale for district view:', lastKnownScale.width, 'x', lastKnownScale.height);
        
        scaleListener = (gameSize) => {
            console.log('[DistrictLayout] Phaser resize event while in district:', gameSize.width, 'x', gameSize.height);
            if (currentLayout !== 'district') return;
            
            const targetWidth = lastKnownScale?.width || gameSize.width;
            const targetHeight = lastKnownScale?.height || gameSize.height;
            const dimensionsChanged = gameSize.width !== targetWidth || gameSize.height !== targetHeight;
            
            if (dimensionsChanged) {
                console.warn('[DistrictLayout] Unexpected resize detected in district view. Restoring preserved dimensions.');
                window.game.scale.resize(targetWidth, targetHeight);
                syncCanvasStyles(targetWidth, targetHeight);
            }
        };
        
        window.game.scale.on('resize', scaleListener);
    }
    
    function detachScaleMonitor() {
        if (window.game?.scale && scaleListener) {
            window.game.scale.off('resize', scaleListener);
        }
        scaleListener = null;
        lastKnownScale = null;
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
        init,
        resizeCanvasForDistrict,
        resizeCanvasForGame
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
