// ------------------------
// UI and HUD
// ------------------------

let scoreEl, waveEl, timerEl, bombsEl, livesEl, powerupsEl;
let districtEl, threatEl, rewardEl;
let assaultHudEl, assaultCoreFillEl, assaultCoreLabelEl, assaultShieldLabelEl;
let radarCanvas, radarCtx;

const KEY_BINDING_ACTIONS = [
    { id: 'moveLeft', label: 'Move Left' },
    { id: 'moveRight', label: 'Move Right' },
    { id: 'moveUp', label: 'Move Up' },
    { id: 'moveDown', label: 'Move Down' },
    { id: 'fire', label: 'Fire' },
    { id: 'transform', label: 'Transform' },
    { id: 'jump', label: 'Jump' },
    { id: 'bomb', label: 'Bomb' },
    { id: 'eject', label: 'Eject' },
    { id: 'enter', label: 'Enter Mech' },
    { id: 'hyperspace', label: 'Hyperspace' },
    { id: 'pause', label: 'Pause' }
];

function formatKeyLabel(keyName) {
    if (!keyName) return 'Unassigned';
    switch (keyName) {
        case 'LEFT':
            return 'Left Arrow';
        case 'RIGHT':
            return 'Right Arrow';
        case 'UP':
            return 'Up Arrow';
        case 'DOWN':
            return 'Down Arrow';
        case 'SPACE':
            return 'Space';
        case 'SHIFT':
            return 'Shift';
        case 'CTRL':
            return 'Ctrl';
        case 'ESC':
            return 'Esc';
        default:
            return keyName;
    }
}

function normalizeKeyName(event) {
    if (!event || !event.key) return null;
    switch (event.key) {
        case ' ':
            return 'SPACE';
        case 'ArrowLeft':
            return 'LEFT';
        case 'ArrowRight':
            return 'RIGHT';
        case 'ArrowUp':
            return 'UP';
        case 'ArrowDown':
            return 'DOWN';
        case 'Shift':
            return 'SHIFT';
        case 'Control':
            return 'CTRL';
        case 'Escape':
            return 'ESC';
        case 'Enter':
            return 'ENTER';
        case 'Tab':
            return 'TAB';
        default:
            break;
    }
    if (event.key.length === 1) {
        return event.key.toUpperCase();
    }
    return event.key.toUpperCase();
}

function createUI(scene) {
    // Get references to DOM elements created in index.html
    scoreEl = document.getElementById('score-el');
    waveEl = document.getElementById('wave-el');
    timerEl = document.getElementById('timer-el');
    bombsEl = document.getElementById('bombs-el');
    livesEl = document.getElementById('lives-el');
    powerupsEl = document.getElementById('powerups-el');
    districtEl = document.getElementById('district-el');
    threatEl = document.getElementById('threat-el');
    rewardEl = document.getElementById('reward-el');
    assaultHudEl = document.getElementById('assault-hud');
    assaultCoreFillEl = document.getElementById('assault-core-fill');
    assaultCoreLabelEl = document.getElementById('assault-core-label');
    assaultShieldLabelEl = document.getElementById('assault-shield-label');
    
    radarCanvas = document.getElementById('radar-canvas');
    if (radarCanvas) {
        radarCtx = radarCanvas.getContext('2d');
    }
}

function updateUI(scene) {
    if (!scoreEl) return;
    const humansGroup = scene?.humans;

    scoreEl.innerText = gameState.score.toString().padStart(6, '0');

    if (gameState.mode === 'survival') {
        if (assaultHudEl) assaultHudEl.classList.add('hidden');
        const activeHumans = humansGroup ? humansGroup.countActive(true) : gameState.humans;
        waveEl.style.display = 'block';
        waveEl.innerText = 'HUMANS: ' + String(activeHumans).padStart(3, '0');

        timerEl.style.display = 'block';
        const t = Math.max(0, gameState.timeRemaining);
        const mins = Math.floor(t / 60000).toString().padStart(2, '0');
        const secs = Math.floor((t % 60000) / 1000).toString().padStart(2, '0');
        timerEl.innerText = `TIME: ${mins}:${secs}`;
    } else if (gameState.mode === 'assault') {
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        const objective = gameState.assaultObjective;
        const baseHp = objective?.baseHp ?? 0;
        const baseMax = objective?.baseHpMax ?? 0;
        waveEl.innerText = 'ASSAULT: BASE CORE TARGET';
        if (assaultHudEl) assaultHudEl.classList.remove('hidden');
        if (assaultCoreFillEl) {
            const pct = baseMax > 0 ? Math.max(0, Math.min(1, baseHp / baseMax)) : 0;
            assaultCoreFillEl.style.width = `${Math.round(pct * 100)}%`;
        }
        if (assaultCoreLabelEl) {
            assaultCoreLabelEl.innerText = `Core ${Math.max(0, Math.ceil(baseHp))}/${Math.max(0, Math.ceil(baseMax))}`;
        }
        if (assaultShieldLabelEl) {
            const shields = objective?.shieldsRemaining ?? 0;
            assaultShieldLabelEl.innerText = `Shields: ${shields}`;
        }
    } else {
        // Classic mode
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        if (assaultHudEl) assaultHudEl.classList.add('hidden');
        
        const enemiesLeft = Math.max(0, (gameState.enemiesToKillThisWave || 0) - (gameState.killsThisWave || 0));
        const waveLimit = typeof CLASSIC_WAVE_LIMIT === 'number' ? CLASSIC_WAVE_LIMIT : 15;
        waveEl.innerText = `WAVE ${gameState.wave}/${waveLimit}  ENEMIES: ${String(enemiesLeft).padStart(3, '0')}`;
    }

    bombsEl.innerText = gameState.smartBombs;
    livesEl.innerText = gameState.lives;

    let powerUpText = '';
    const p = playerState.powerUps;
    if (p.laser > 0) {
        const laserTypes = ['', 'SPREAD', 'WAVE'];
        powerUpText += `[${laserTypes[p.laser]}] `;
    }
    if (p.drone > 0) powerUpText += `[DRONES:${p.drone}] `;
    if (p.shield > 0) powerUpText += `[SHIELD] `;
    if (p.missile > 0) powerUpText += '[MISSILES] ';
    if (p.overdrive > 0) powerUpText += `[OVERDRIVE:${Math.ceil(p.overdrive/1000)}s] `;
    if (p.rapid > 0) powerUpText += `[RAPID:${Math.ceil(p.rapid/1000)}s] `;
    if (p.multiShot > 0) powerUpText += '[MULTI] ';
    if (p.rearShot > 0) powerUpText += '[REAR] ';
    if (p.sideShot > 0) powerUpText += '[SIDE] ';
    if (p.piercing > 0) powerUpText += '[PIERCING] ';
    if (p.speed > 0) powerUpText += `[SPEED:${Math.ceil(p.speed/1000)}s] `;
    if (p.magnet > 0) powerUpText += `[MAGNET:${Math.ceil(p.magnet/1000)}s] `;
    if (p.double > 0) powerUpText += `[2X DMG:${Math.ceil(p.double/1000)}s] `;
    if (p.invincibility > 0) powerUpText += `[INVINCIBLE:${Math.ceil(p.invincibility/1000)}s] `;
    if (p.timeSlow > 0) powerUpText += `[SLOW:${Math.ceil(p.timeSlow/1000)}s] `;

    powerupsEl.innerText = powerUpText || '[NORMAL FIRE]';

    if (districtEl && threatEl && rewardEl) {
        const directives = gameState.missionDirectives;
        if (directives) {
            const timerLabel = typeof directives.timer === 'number'
                ? formatMetaTimer(directives.timer)
                : 'N/A';
            districtEl.innerText = `DISTRICT: ${directives.districtName || directives.districtId || 'Unknown'} (${directives.status || 'unknown'})`;
            threatEl.innerText = `THREAT: ${directives.urgency ? directives.urgency.toUpperCase() : 'STABLE'} · T-${timerLabel}`;
            rewardEl.innerText = `REWARDS: x${(gameState.rewardMultiplier || 1).toFixed(2)} · ${directives.reward || 'Standard'}`;
        } else {
            districtEl.innerText = 'DISTRICT: Free Patrol';
            threatEl.innerText = 'THREAT: Neutral';
            rewardEl.innerText = 'REWARDS: x1.00 standard loot';
        }
    }
}

function formatMetaTimer(seconds) {
    const clamped = Math.max(0, Math.floor(seconds));
    const mins = String(Math.floor(clamped / 60)).padStart(2, '0');
    const secs = String(clamped % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

function updateRadar(scene) {
    if (!radarCtx || !scene) return;
    const { enemies, garrisonDefenders, humans } = scene;
    const player = getActivePlayer(scene);
    if (!player) return;
    
    const width = radarCanvas.width;
    const height = radarCanvas.height;
    
    // Clear background
    radarCtx.fillStyle = '#001111';
    radarCtx.fillRect(0, 0, width, height);
    
    // Scale: Minimap width covers the whole World Width
    const scaleX = width / CONFIG.worldWidth;
    
    // 1. Draw Terrain line (approximate)
    radarCtx.strokeStyle = '#443322';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.moveTo(0, height - 5);
    radarCtx.lineTo(width, height - 5);
    radarCtx.stroke();
    
    // 2. Draw Camera Viewport Box
    const cam = scene.cameras.main;
    let viewX = cam.scrollX * scaleX;
    const viewW = cam.width * scaleX;
    
    radarCtx.strokeStyle = '#006666';
    radarCtx.lineWidth = 1.5;
    radarCtx.strokeRect(viewX, 1, viewW, height - 2);
    
    // Handle camera wrapping
    if (viewX < 0) {
        radarCtx.strokeRect(viewX + width, 1, viewW, height - 2);
    } else if (viewX + viewW > width) {
        radarCtx.strokeRect(viewX - width, 1, viewW, height - 2);
    }

    // 3. Draw Enemies
    if (enemies) {
        enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            const ex = enemy.x * scaleX;
            const ey = (enemy.y / CONFIG.worldHeight) * height;
            
            // Radar Colors for ALL enemy types
            let color = '#ff0000'; // Default Red
            switch (enemy.enemyType) {
                case 'lander':      color = '#ff4444'; break;
                case 'mutant':      color = '#ff8800'; break; // Orange
                case 'drone':       color = '#ff44ff'; break; // Pink
                case 'bomber':      color = '#ff0000'; break; // Bright Red
                case 'pod':         color = '#aa00ff'; break; // Purple
                case 'swarmer':     color = '#00ff00'; break; // Green
                case 'baiter':      color = '#00ffff'; break; // Cyan
                
                // New Enemies
                case 'kamikaze':    color = '#ff2200'; break; // Red-Orange
                case 'turret':      color = '#aaaaaa'; break; // Grey
                case 'shield':      color = '#0088ff'; break; // Blue
                case 'seeker':      color = '#9900ff'; break; // Violet
                case 'spawner':     color = '#ffff00'; break; // Yellow
                case 'shielder':    color = '#00ff88'; break; // Sea Green
                case 'bouncer':     color = '#ff6600'; break; // Pumpkin
                case 'sniper':      color = '#ffffff'; break; // White
                case 'swarmLeader': color = '#4400cc'; break; // Deep Blue
                case 'regenerator': color = '#00aaaa'; break; // Teal
            }
            
            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            // Make bosses/heavy units slightly larger on radar
            const size = (enemy.enemyType === 'shield' || enemy.enemyType === 'spawner' || enemy.enemyType === 'turret') ? 3.5 : 2;
            radarCtx.arc(ex, ey, size, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    // 3b. Draw Garrison Defenders
    if (garrisonDefenders) {
        garrisonDefenders.children.entries.forEach(defender => {
            if (!defender.active) return;
            const dx = defender.x * scaleX;
            const dy = (defender.y / CONFIG.worldHeight) * height;
            let color = '#ffbb44';
            switch (defender.garrisonType) {
                case 'rifle': color = '#f97316'; break;
                case 'shield': color = '#38bdf8'; break;
                case 'heavy': color = '#fb7185'; break;
                case 'sniper': color = '#e2e8f0'; break;
                case 'medic': color = '#7dd3fc'; break;
                case 'engineer': color = '#f59e0b'; break;
                case 'jetpack': color = '#60a5fa'; break;
                case 'drone': color = '#22d3ee'; break;
                case 'walker': color = '#94a3b8'; break;
                case 'hound': color = '#fb923c'; break;
            }
            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            radarCtx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    // 4. Draw Humans
    if (humans) {
        radarCtx.fillStyle = '#ffaa00';
        humans.children.entries.forEach(human => {
            if (!human.active) return;
            const hx = human.x * scaleX;
            const hy = (human.y / CONFIG.worldHeight) * height;
            radarCtx.beginPath();
            radarCtx.arc(hx, hy, 2, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    // 5. Draw Player
    if (player && player.active) {
        const px = player.x * scaleX;
        const py = (player.y / CONFIG.worldHeight) * height;
        
        radarCtx.fillStyle = '#ffffff';
        radarCtx.fillRect(px - 2, py - 2, 4, 4);
    }
}

// ------------------------
// Overlays (Game Over / Win / Pause)
// ------------------------

function gameOver(scene) {
    const audioManager = scene.audioManager;
    gameState.gameOver = true;
    if (window.missionPlanner) missionPlanner.recordMissionOutcome(false);
    const metaResult = recordMetaOutcome(false);
    scene.physics.pause();
    if (audioManager) {
        audioManager.playSound('gameOver');
        audioManager.stopMusic();
    }

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;

    // Background
    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 50, 'GAME OVER', {
        fontSize: '64px', fontFamily: 'Orbitron', color: '#ff0000', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    scene.add.text(centerX, centerY + 30,
        `Final Score: ${gameState.score}\nHumans Rescued: ${gameState.humansRescued}\n` +
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`, {
        fontSize: '24px', fontFamily: 'Orbitron', color: '#00ffff', align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 120;

    const restartButton = scene.add.text(centerX - 120, buttonY, '[ R ] RESTART', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 120, buttonY, '[ M ] MAIN MENU', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    // Input Handling
    scene.input.keyboard.once('keydown-R', () => {
        resetGameState();
        scene.scene.restart();
    });
    scene.input.keyboard.once('keydown-M', () => returnToMainMenu(scene));

    restartButton.on('pointerdown', () => {
        resetGameState();
        scene.scene.restart();
    });
    menuButton.on('pointerdown', () => returnToMainMenu(scene));
}

function winGame(scene) {
    const audioManager = scene.audioManager;
    gameState.gameOver = true;
    if (window.missionPlanner) missionPlanner.recordMissionOutcome(true);
    const metaResult = recordMetaOutcome(true);
    scene.physics.pause();
    if (audioManager) {
        audioManager.playSound('waveComplete');
        audioManager.stopMusic();
    }

    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;

    scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.7)
        .setScrollFactor(0).setDepth(990);

    scene.add.text(centerX, centerY - 50, 'MISSION COMPLETE!', {
        fontSize: '64px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    scene.add.text(centerX, centerY + 30,
        `Victory!\nFinal Score: ${gameState.score}\n` +
        `Meta Credits: +${metaResult?.earnedCredits || 0} (Bank: ${metaProgression?.getMetaState?.().credits || 0})`, {
        fontSize: '24px', fontFamily: 'Orbitron', color: '#00ffff', align: 'center', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

    const buttonY = centerY + 120;
    const restartButton = scene.add.text(centerX - 120, buttonY, '[ R ] RESTART', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    const menuButton = scene.add.text(centerX + 120, buttonY, '[ M ] MAIN MENU', {
        fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

    scene.input.keyboard.once('keydown-R', () => {
        resetGameState();
        scene.scene.restart();
    });
    scene.input.keyboard.once('keydown-M', () => returnToMainMenu(scene));

    restartButton.on('pointerdown', () => {
        resetGameState();
        scene.scene.restart();
    });
    menuButton.on('pointerdown', () => returnToMainMenu(scene));
}

function recordMetaOutcome(success) {
    if (!window.metaProgression || gameState.metaRewardsGranted) return null;
    const outcome = {
        success,
        score: gameState.score,
        humansRescued: gameState.humansRescued,
        mode: gameState.mode,
        directives: gameState.missionDirectives,
        districtId: gameState.missionContext?.district,
        districtName: gameState.missionDirectives?.districtName || gameState.missionContext?.city
    };
    const result = metaProgression.recordRunOutcome(outcome);
    gameState.metaRewardsGranted = true;
    return result;
}

function togglePause(scene) {
    const audioManager = scene.audioManager;
    gameState.paused = !gameState.paused;
    
    if (gameState.paused) {
        scene.physics.pause();
        scene.isRebindingKey = false;
        
        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2;
        
        const overlay = scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(998).setInteractive();
            
        const pauseTitle = scene.add.text(centerX, centerY - 80, 'PAUSED', {
            fontSize: '48px', fontFamily: 'Orbitron', color: '#00ffff', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
        
        const resumeText = scene.add.text(centerX - 200, centerY - 20, '[ P ] RESUME', {
            fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
        
        const menuText = scene.add.text(centerX + 200, centerY - 20, '[ M ] MAIN MENU', {
            fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

        const keyMapButtonBg = scene.add.rectangle(centerX, centerY - 20, 200, 34, 0x0ea5e9, 0.25)
            .setScrollFactor(0)
            .setDepth(998)
            .setStrokeStyle(2, 0x38bdf8, 0.7)
            .setInteractive({ useHandCursor: true });
        
        const keyMapButton = scene.add.text(centerX, centerY - 20, 'HIDE KEY BINDINGS', {
            fontSize: '18px', fontFamily: 'Orbitron', color: '#38bdf8', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });

        // Volume Controls
        const volumeTitle = scene.add.text(centerX, centerY + 30, 'VOLUME', {
            fontSize: '18px', fontFamily: 'Orbitron', color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999);

        // Music Slider
        const musicLabel = scene.add.text(centerX - 150, centerY + 60, 'Music', { fontSize: '16px', fontFamily: 'Orbitron', color: '#00ffff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
        const musicSlider = scene.add.rectangle(centerX + 50, centerY + 60, 150, 8, 0x444444, 1).setScrollFactor(0).setDepth(999);
        const musicKnob = scene.add.circle(
            centerX + 50 + (audioManager ? audioManager.musicVolume * 150 : 90) - 75,
            centerY + 60, 12, 0x00ffff, 1
        ).setScrollFactor(0).setDepth(1000).setInteractive();

        // SFX Slider
        const sfxLabel = scene.add.text(centerX - 150, centerY + 90, 'SFX', { fontSize: '16px', fontFamily: 'Orbitron', color: '#00ffff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
        const sfxSlider = scene.add.rectangle(centerX + 50, centerY + 90, 150, 8, 0x444444, 1).setScrollFactor(0).setDepth(999);
        const sfxKnob = scene.add.circle(
            centerX + 50 + (audioManager ? audioManager.sfxVolume * 150 : 105) - 75,
            centerY + 90, 12, 0x00ff00, 1
        ).setScrollFactor(0).setDepth(1000).setInteractive();

        // Flash reduction toggle
        const flashLabel = scene.add.text(centerX - 150, centerY + 125, 'Reduce Screen Flashes', { fontSize: '16px', fontFamily: 'Orbitron', color: '#00ffff' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
        const flashToggle = scene.add.rectangle(centerX + 40, centerY + 125, 32, 18, 0x111827, 1)
            .setStrokeStyle(2, 0x00ffff, 0.7)
            .setScrollFactor(0)
            .setDepth(999)
            .setInteractive({ useHandCursor: true });
        const flashThumb = scene.add.circle(
            centerX + 32 + (userSettings.reduceFlashes ? 14 : 0),
            centerY + 125,
            8,
            userSettings.reduceFlashes ? 0x22c55e : 0x0ea5e9,
            1
        ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
        flashThumb._baseX = centerX + 32;
        const flashText = scene.add.text(centerX + 65, centerY + 125, userSettings.reduceFlashes ? 'On' : 'Off', {
            fontSize: '14px', fontFamily: 'Orbitron', color: userSettings.reduceFlashes ? '#22c55e' : '#38bdf8'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);

        const keyMapPanel = scene.add.rectangle(centerX, centerY + 140, 460, 220, 0x0b1220, 0.92)
            .setScrollFactor(0)
            .setDepth(998)
            .setStrokeStyle(2, 0x00ffff, 0.6)
            .setVisible(true);
        const panelTop = keyMapPanel.y - keyMapPanel.height / 2;
        const panelLeft = keyMapPanel.x - keyMapPanel.width / 2;
        const keyMapHint = scene.add.text(centerX, panelTop + 12,
            'Click a key to rebind. Press Esc to cancel.', {
                fontSize: '12px', fontFamily: 'Orbitron', color: '#94a3b8'
            }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(999).setVisible(true);

        const keyMapLabelTexts = [];
        const keyMapValueTexts = [];
        const entriesPerColumn = Math.ceil(KEY_BINDING_ACTIONS.length / 2);
        KEY_BINDING_ACTIONS.forEach((action, index) => {
            const column = index < entriesPerColumn ? 0 : 1;
            const row = column === 0 ? index : index - entriesPerColumn;
            const xBase = column === 0 ? panelLeft + 18 : panelLeft + keyMapPanel.width / 2 + 12;
            const y = panelTop + 36 + row * 26;

            const label = scene.add.text(xBase, y, `${action.label}:`, {
                fontSize: '13px', fontFamily: 'Orbitron', color: '#e2e8f0'
            }).setOrigin(0, 0).setScrollFactor(0).setDepth(999).setVisible(true);

            const value = scene.add.text(xBase + 150, y, `[ ${formatKeyLabel(userSettings.keyBindings[action.id])} ]`, {
                fontSize: '13px', fontFamily: 'Orbitron', color: '#38bdf8'
            }).setOrigin(0, 0).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(true);

            value.on('pointerover', () => value.setColor('#7dd3fc'));
            value.on('pointerout', () => value.setColor('#38bdf8'));

            keyMapLabelTexts.push(label);
            keyMapValueTexts.push({ actionId: action.id, text: value });
        });

        scene.pauseUI = { 
            overlay, pauseTitle, resumeText, menuText, keyMapButton, keyMapButtonBg,
            volumeTitle, musicLabel, musicSlider, musicKnob, sfxLabel, sfxSlider, sfxKnob,
            flashLabel, flashToggle, flashThumb, flashText,
            keyMapPanel, keyMapHint, keyMapLabelTexts, keyMapValueTexts
        };

        resumeText.on('pointerdown', () => togglePause(scene));
        menuText.on('pointerdown', () => returnToMainMenu(scene));
        
        let dragTarget = null;

        const updateKeyMapValues = () => {
            keyMapValueTexts.forEach(({ actionId, text }) => {
                text.setText(`[ ${formatKeyLabel(userSettings.keyBindings[actionId])} ]`);
            });
        };

        const setKeyMapVisibility = (visible) => {
            keyMapPanel.setVisible(visible);
            keyMapHint.setVisible(visible);
            keyMapLabelTexts.forEach(text => text.setVisible(visible));
            keyMapValueTexts.forEach(({ text }) => text.setVisible(visible));
            keyMapButton.setText(visible ? 'HIDE KEY BINDINGS' : 'SHOW KEY BINDINGS');
        };

        const cancelRebind = () => {
            scene.isRebindingKey = false;
            keyMapHint.setText('Click a key to rebind. Press Esc to cancel.').setColor('#94a3b8');
            if (scene.keyRebindHandler) {
                scene.input.keyboard.off('keydown', scene.keyRebindHandler);
                scene.keyRebindHandler = null;
            }
        };

        const startKeyRebind = (actionId, actionLabel) => {
            if (!keyMapPanel.visible) setKeyMapVisibility(true);
            if (scene.keyRebindHandler) {
                scene.input.keyboard.off('keydown', scene.keyRebindHandler);
                scene.keyRebindHandler = null;
            }
            scene.isRebindingKey = true;
            keyMapHint.setText(`Press a key for ${actionLabel} (Esc to cancel).`).setColor('#fbbf24');

            scene.keyRebindHandler = (event) => {
                if (event.key === 'Escape') {
                    cancelRebind();
                    return;
                }
                const normalized = normalizeKeyName(event);
                if (!normalized || !Phaser.Input.Keyboard.KeyCodes[normalized]) {
                    keyMapHint.setText('Unsupported key. Try another.').setColor('#f87171');
                    return;
                }
                const existingAction = Object.keys(userSettings.keyBindings).find(key => userSettings.keyBindings[key] === normalized);
                if (existingAction && existingAction !== actionId) {
                    const conflict = KEY_BINDING_ACTIONS.find(action => action.id === existingAction);
                    keyMapHint.setText(`Already bound to ${conflict?.label || existingAction}.`).setColor('#f87171');
                    return;
                }
                userSettings.keyBindings[actionId] = normalized;
                persistUserSettings();
                if (scene.refreshKeyBindings) scene.refreshKeyBindings();
                updateKeyMapValues();
                cancelRebind();
            };
            scene.input.keyboard.on('keydown', scene.keyRebindHandler);
        };

        const toggleKeyMap = () => {
            setKeyMapVisibility(!keyMapPanel.visible);
        };

        keyMapButton.on('pointerdown', toggleKeyMap);
        keyMapButtonBg.on('pointerdown', toggleKeyMap);
        keyMapValueTexts.forEach(({ actionId, text }) => {
            const actionLabel = KEY_BINDING_ACTIONS.find(action => action.id === actionId)?.label || actionId;
            text.on('pointerdown', () => startKeyRebind(actionId, actionLabel));
        });
        musicKnob.on('pointerdown', () => { dragTarget = 'music'; });
        sfxKnob.on('pointerdown', () => { dragTarget = 'sfx'; });
        flashToggle.on('pointerdown', () => toggleFlashReduction(flashThumb, flashText));
        flashThumb.on('pointerdown', () => toggleFlashReduction(flashThumb, flashText));

        const onPointerUp = () => { dragTarget = null; };
        const onPointerMove = (pointer) => {
            if (!dragTarget || !audioManager) return;
            const sliderCenterX = centerX + 50;
            const sliderWidth = 150;
            const sliderLeft = sliderCenterX - sliderWidth / 2;
            const sliderRight = sliderCenterX + sliderWidth / 2;
            
            const clampedX = Phaser.Math.Clamp(pointer.x, sliderLeft, sliderRight);
            const normalized = (clampedX - sliderLeft) / sliderWidth;
            
            if (dragTarget === 'music') {
                audioManager.setMusicVolume(normalized);
                musicKnob.x = clampedX;
            } else {
                audioManager.setSFXVolume(normalized);
                sfxKnob.x = clampedX;
            }
        };
        
        scene.input.on('pointerup', onPointerUp);
        scene.input.on('pointermove', onPointerMove);
        
        scene.pauseHandlers = { onPointerUp, onPointerMove };
        
        if (scene.menuKeyHandler) scene.input.keyboard.off('keydown-M', scene.menuKeyHandler);
        scene.menuKeyHandler = () => {
            if (scene.isRebindingKey) return;
            returnToMainMenu(scene);
        };
        scene.input.keyboard.once('keydown-M', scene.menuKeyHandler);
        scene.keyMapHandler = () => {
            if (scene.isRebindingKey) return;
            toggleKeyMap();
        };
        scene.input.keyboard.on('keydown-K', scene.keyMapHandler);

    } else {
        scene.physics.resume();
        cleanupPauseUI(scene);
    }
}

function cleanupPauseUI(scene) {
    if (scene.pauseUI) {
        Object.values(scene.pauseUI).forEach(el => {
            if (!el) return;
            if (Array.isArray(el)) {
                el.forEach(item => {
                    const target = item?.text || item;
                    if (target && target.destroy) target.destroy();
                });
                return;
            }
            if (el.destroy) el.destroy();
        });
        scene.pauseUI = null;
    }
    if (scene.pauseHandlers) {
        scene.input.off('pointerup', scene.pauseHandlers.onPointerUp);
        scene.input.off('pointermove', scene.pauseHandlers.onPointerMove);
        scene.pauseHandlers = null;
    }
    if (scene.keyRebindHandler) {
        scene.input.keyboard.off('keydown', scene.keyRebindHandler);
        scene.keyRebindHandler = null;
    }
    scene.isRebindingKey = false;
    if (scene.menuKeyHandler) {
        scene.input.keyboard.off('keydown-M', scene.menuKeyHandler);
        scene.menuKeyHandler = null;
    }
    if (scene.keyMapHandler) {
        scene.input.keyboard.off('keydown-K', scene.keyMapHandler);
        scene.keyMapHandler = null;
    }
}

function toggleFlashReduction(thumb, label) {
    userSettings.reduceFlashes = !userSettings.reduceFlashes;
    persistUserSettings();
    const isOn = userSettings.reduceFlashes;
    if (thumb) {
        const baseX = thumb._baseX || thumb.x - (isOn ? 14 : 0);
        thumb.x = baseX + (isOn ? 14 : 0);
        thumb.fillColor = isOn ? 0x22c55e : 0x0ea5e9;
    }
    if (label) {
        label.setText(isOn ? 'On' : 'Off');
        label.setColor(isOn ? '#22c55e' : '#38bdf8');
    }
}

function returnToMainMenu(scene) {
    cleanupPauseUI(scene);
    resetGameState();

    if (window.game && game.scene) {
        if (game.scene.isActive(SCENE_KEYS.build)) {
            game.scene.stop(SCENE_KEYS.build);
        }
        if (game.scene.isActive(SCENE_KEYS.game)) {
            game.scene.stop(SCENE_KEYS.game);
        }
        if (!game.scene.isActive(SCENE_KEYS.menu)) {
            game.scene.start(SCENE_KEYS.menu);
        } else {
            game.scene.bringToTop(SCENE_KEYS.menu);
        }
    }

    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'flex';

    const toggleBtn = document.getElementById('build-toggle');
    const returnBtn = document.getElementById('build-return');
    if (toggleBtn) toggleBtn.classList.remove('hidden');
    if (returnBtn) returnBtn.classList.add('hidden');
}
