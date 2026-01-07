// ------------------------
// file js/ui/ui.js UI and HUD
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
        case 'LEFT': return 'Left Arrow';
        case 'RIGHT': return 'Right Arrow';
        case 'UP': return 'Up Arrow';
        case 'DOWN': return 'Down Arrow';
        case 'SPACE': return 'Space';
        case 'SHIFT': return 'Shift';
        case 'CTRL': return 'Ctrl';
        case 'ESC': return 'Esc';
        default: return keyName;
    }
}

function normalizeKeyName(event) {
    if (!event || !event.key) return null;
    switch (event.key) {
        case ' ': return 'SPACE';
        case 'ArrowLeft': return 'LEFT';
        case 'ArrowRight': return 'RIGHT';
        case 'ArrowUp': return 'UP';
        case 'ArrowDown': return 'DOWN';
        case 'Shift': return 'SHIFT';
        case 'Control': return 'CTRL';
        case 'Escape': return 'ESC';
        case 'Enter': return 'ENTER';
        case 'Tab': return 'TAB';
        default: break;
    }
    if (event.key.length === 1) {
        return event.key.toUpperCase();
    }
    return event.key.toUpperCase();
}

function createUI(scene) {
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
    
    radarCtx.fillStyle = '#001111';
    radarCtx.fillRect(0, 0, width, height);
    
    const scaleX = width / CONFIG.worldWidth;
    
    radarCtx.strokeStyle = '#443322';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.moveTo(0, height - 5);
    radarCtx.lineTo(width, height - 5);
    radarCtx.stroke();
    
    const cam = scene.cameras.main;
    let viewX = cam.scrollX * scaleX;
    const viewW = cam.width * scaleX;
    
    radarCtx.strokeStyle = '#006666';
    radarCtx.lineWidth = 1.5;
    radarCtx.strokeRect(viewX, 1, viewW, height - 2);
    
    if (viewX < 0) {
        radarCtx.strokeRect(viewX + width, 1, viewW, height - 2);
    } else if (viewX + viewW > width) {
        radarCtx.strokeRect(viewX - width, 1, viewW, height - 2);
    }

    if (enemies) {
        enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            const ex = enemy.x * scaleX;
            const ey = (enemy.y / CONFIG.worldHeight) * height;
            
            let color = '#ff0000';
            switch (enemy.enemyType) {
                case 'lander': color = '#ff4444'; break;
                case 'mutant': color = '#ff8800'; break;
                case 'drone': color = '#ff44ff'; break;
                case 'bomber': color = '#ff0000'; break;
                case 'pod': color = '#aa00ff'; break;
                case 'swarmer': color = '#00ff00'; break;
                case 'baiter': color = '#00ffff'; break;
                case 'kamikaze': color = '#ff2200'; break;
                case 'turret': color = '#aaaaaa'; break;
                case 'shield': color = '#0088ff'; break;
                case 'seeker': color = '#9900ff'; break;
                case 'spawner': color = '#ffff00'; break;
                case 'shielder': color = '#00ff88'; break;
                case 'bouncer': color = '#ff6600'; break;
                case 'sniper': color = '#ffffff'; break;
                case 'swarmLeader': color = '#4400cc'; break;
                case 'regenerator': color = '#00aaaa'; break;
            }
            
            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            const size = (enemy.enemyType === 'shield' || enemy.enemyType === 'spawner' || enemy.enemyType === 'turret') ? 3.5 : 2;
            radarCtx.arc(ex, ey, size, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

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
        scene.pauseMenuView = 'main'; // 'main' or 'keybindings'
        
        createPauseMenu(scene, audioManager);
    } else {
        scene.physics.resume();
        cleanupPauseUI(scene);
    }
}

function createPauseMenu(scene, audioManager) {
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    
    // Main overlay (always visible when paused)
    const overlay = scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.85)
        .setScrollFactor(0).setDepth(998).setInteractive();
    
    // === MAIN PAUSE MENU ELEMENTS ===
    const mainElements = [];
    
    const pauseTitle = scene.add.text(centerX, 60, 'PAUSED', {
        fontSize: '48px', fontFamily: 'Orbitron', color: '#00ffff', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(pauseTitle);
    
    // Resume and Menu buttons
    const resumeText = scene.add.text(centerX - 150, 120, '[ P ] RESUME', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(resumeText);
    
    const menuText = scene.add.text(centerX + 150, 120, '[ M ] MAIN MENU', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(menuText);

    // Volume Controls Section
    const volumeTitle = scene.add.text(centerX, 170, 'AUDIO', {
        fontSize: '16px', fontFamily: 'Orbitron', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(volumeTitle);

    // Music Slider
    const musicLabel = scene.add.text(centerX - 140, 200, 'Music', { 
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff' 
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(musicLabel);
    
    const musicSlider = scene.add.rectangle(centerX + 40, 200, 150, 8, 0x444444, 1)
        .setScrollFactor(0).setDepth(999);
    mainElements.push(musicSlider);
    
    const musicKnob = scene.add.circle(
        centerX + 40 + (audioManager ? audioManager.musicVolume * 150 : 90) - 75,
        200, 10, 0x00ffff, 1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    mainElements.push(musicKnob);

    // SFX Slider
    const sfxLabel = scene.add.text(centerX - 140, 230, 'SFX', { 
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff' 
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(sfxLabel);
    
    const sfxSlider = scene.add.rectangle(centerX + 40, 230, 150, 8, 0x444444, 1)
        .setScrollFactor(0).setDepth(999);
    mainElements.push(sfxSlider);
    
    const sfxKnob = scene.add.circle(
        centerX + 40 + (audioManager ? audioManager.sfxVolume * 150 : 105) - 75,
        230, 10, 0x00ff00, 1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    mainElements.push(sfxKnob);

    // Flash reduction toggle
    const flashLabel = scene.add.text(centerX - 140, 265, 'Reduce Flashes', { 
        fontSize: '14px', fontFamily: 'Orbitron', color: '#00ffff' 
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(flashLabel);
    
    const flashToggle = scene.add.rectangle(centerX + 30, 265, 32, 18, 0x111827, 1)
        .setStrokeStyle(2, 0x00ffff, 0.7)
        .setScrollFactor(0)
        .setDepth(999)
        .setInteractive({ useHandCursor: true });
    mainElements.push(flashToggle);
    
    const flashThumb = scene.add.circle(
        centerX + 22 + (userSettings.reduceFlashes ? 14 : 0),
        265,
        7,
        userSettings.reduceFlashes ? 0x22c55e : 0x0ea5e9,
        1
    ).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
    flashThumb._baseX = centerX + 22;
    mainElements.push(flashThumb);
    
    const flashText = scene.add.text(centerX + 55, 265, userSettings.reduceFlashes ? 'On' : 'Off', {
        fontSize: '12px', fontFamily: 'Orbitron', color: userSettings.reduceFlashes ? '#22c55e' : '#38bdf8'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999);
    mainElements.push(flashText);

    // Key Bindings Button
    const keyBindingsButton = scene.add.text(centerX, 320, '[ K ] KEY BINDINGS', {
        fontSize: '18px', fontFamily: 'Orbitron', color: '#38bdf8', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
    mainElements.push(keyBindingsButton);

    // === KEY BINDINGS VIEW ELEMENTS ===
    const keyBindingsElements = [];
    
    const keyBindingsTitle = scene.add.text(centerX, 50, 'KEY BINDINGS', {
        fontSize: '36px', fontFamily: 'Orbitron', color: '#38bdf8', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);
    keyBindingsElements.push(keyBindingsTitle);
    
    const keyBindingsHint = scene.add.text(centerX, 90, 'Click a binding to change it. Press ESC to cancel.', {
        fontSize: '12px', fontFamily: 'Orbitron', color: '#94a3b8'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setVisible(false);
    keyBindingsElements.push(keyBindingsHint);
    
    const backButton = scene.add.text(centerX, CONFIG.height - 50, '[ ESC ] BACK TO PAUSE MENU', {
        fontSize: '16px', fontFamily: 'Orbitron', color: '#fbbf24', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
    keyBindingsElements.push(backButton);
    
    // Create key binding rows
    const keyMapValueTexts = [];
    const panelStartY = 130;
    const rowHeight = 32;
    const entriesPerColumn = Math.ceil(KEY_BINDING_ACTIONS.length / 2);
    
    KEY_BINDING_ACTIONS.forEach((action, index) => {
        const column = index < entriesPerColumn ? 0 : 1;
        const row = column === 0 ? index : index - entriesPerColumn;
        const xBase = column === 0 ? centerX - 220 : centerX + 30;
        const y = panelStartY + row * rowHeight;

        const label = scene.add.text(xBase, y, `${action.label}:`, {
            fontSize: '14px', fontFamily: 'Orbitron', color: '#e2e8f0'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999).setVisible(false);
        keyBindingsElements.push(label);

        const value = scene.add.text(xBase + 140, y, `[ ${formatKeyLabel(userSettings.keyBindings[action.id])} ]`, {
            fontSize: '14px', fontFamily: 'Orbitron', color: '#38bdf8'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
        keyBindingsElements.push(value);

        value.on('pointerover', () => value.setColor('#7dd3fc'));
        value.on('pointerout', () => {
            if (!scene.isRebindingKey || scene.rebindingAction !== action.id) {
                value.setColor('#38bdf8');
            }
        });

        keyMapValueTexts.push({ actionId: action.id, label: action.label, text: value });
    });

    // Reset to Defaults button
    const resetButton = scene.add.text(centerX, CONFIG.height - 90, '[ RESET TO DEFAULTS ]', {
        fontSize: '14px', fontFamily: 'Orbitron', color: '#f87171', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true }).setVisible(false);
    keyBindingsElements.push(resetButton);

    // Store references
    scene.pauseUI = { 
        overlay,
        mainElements,
        keyBindingsElements,
        keyMapValueTexts,
        keyBindingsHint,
        flashThumb,
        flashText,
        musicKnob,
        sfxKnob
    };

    // === EVENT HANDLERS ===
    
    const showMainMenu = () => {
        scene.pauseMenuView = 'main';
        mainElements.forEach(el => el.setVisible(true));
        keyBindingsElements.forEach(el => el.setVisible(false));
        keyMapValueTexts.forEach(({ text }) => text.setVisible(false));
        cancelRebind();
    };
    
    const showKeyBindings = () => {
        scene.pauseMenuView = 'keybindings';
        mainElements.forEach(el => el.setVisible(false));
        keyBindingsElements.forEach(el => el.setVisible(true));
        keyMapValueTexts.forEach(({ text }) => text.setVisible(true));
    };
    
    const updateKeyMapValues = () => {
        keyMapValueTexts.forEach(({ actionId, text }) => {
            text.setText(`[ ${formatKeyLabel(userSettings.keyBindings[actionId])} ]`);
        });
    };
    
    const cancelRebind = () => {
        scene.isRebindingKey = false;
        scene.rebindingAction = null;
        keyBindingsHint.setText('Click a binding to change it. Press ESC to cancel.').setColor('#94a3b8');
        if (scene.keyRebindHandler) {
            scene.input.keyboard.off('keydown', scene.keyRebindHandler);
            scene.keyRebindHandler = null;
        }
    };
    
    const startKeyRebind = (actionId, actionLabel, textObj) => {
        if (scene.keyRebindHandler) {
            scene.input.keyboard.off('keydown', scene.keyRebindHandler);
            scene.keyRebindHandler = null;
        }
        
        scene.isRebindingKey = true;
        scene.rebindingAction = actionId;
        keyBindingsHint.setText(`Press a key for "${actionLabel}"...`).setColor('#fbbf24');
        textObj.setColor('#fbbf24');

        scene.keyRebindHandler = (event) => {
            if (event.key === 'Escape') {
                textObj.setColor('#38bdf8');
                cancelRebind();
                return;
            }
            
            const normalized = normalizeKeyName(event);
            if (!normalized || !Phaser.Input.Keyboard.KeyCodes[normalized]) {
                keyBindingsHint.setText('Unsupported key. Try another.').setColor('#f87171');
                return;
            }
            
            const existingAction = Object.keys(userSettings.keyBindings).find(
                key => userSettings.keyBindings[key] === normalized && key !== actionId
            );
            if (existingAction) {
                const conflict = KEY_BINDING_ACTIONS.find(a => a.id === existingAction);
                keyBindingsHint.setText(`Already bound to "${conflict?.label || existingAction}".`).setColor('#f87171');
                return;
            }
            
            userSettings.keyBindings[actionId] = normalized;
            persistUserSettings();
            if (scene.refreshKeyBindings) scene.refreshKeyBindings();
            updateKeyMapValues();
            textObj.setColor('#38bdf8');
            cancelRebind();
        };
        
        scene.input.keyboard.on('keydown', scene.keyRebindHandler);
    };

    // Main menu interactions
    resumeText.on('pointerdown', () => togglePause(scene));
    menuText.on('pointerdown', () => returnToMainMenu(scene));
    keyBindingsButton.on('pointerdown', showKeyBindings);
    
    // Key bindings interactions
    backButton.on('pointerdown', showMainMenu);
    
    resetButton.on('pointerdown', () => {
        userSettings.keyBindings = { ...DEFAULT_KEY_BINDINGS };
        persistUserSettings();
        if (scene.refreshKeyBindings) scene.refreshKeyBindings();
        updateKeyMapValues();
        keyBindingsHint.setText('Key bindings reset to defaults!').setColor('#22c55e');
        scene.time.delayedCall(2000, () => {
            if (keyBindingsHint.active) {
                keyBindingsHint.setText('Click a binding to change it. Press ESC to cancel.').setColor('#94a3b8');
            }
        });
    });
    
    keyMapValueTexts.forEach(({ actionId, label, text }) => {
        text.on('pointerdown', () => startKeyRebind(actionId, label, text));
    });
    
    // Flash toggle
    const toggleFlash = () => {
        userSettings.reduceFlashes = !userSettings.reduceFlashes;
        persistUserSettings();
        const isOn = userSettings.reduceFlashes;
        flashThumb.x = flashThumb._baseX + (isOn ? 14 : 0);
        flashThumb.fillColor = isOn ? 0x22c55e : 0x0ea5e9;
        flashText.setText(isOn ? 'On' : 'Off');
        flashText.setColor(isOn ? '#22c55e' : '#38bdf8');
    };
    flashToggle.on('pointerdown', toggleFlash);
    flashThumb.on('pointerdown', toggleFlash);

    // Volume sliders
    let dragTarget = null;
    musicKnob.on('pointerdown', () => { dragTarget = 'music'; });
    sfxKnob.on('pointerdown', () => { dragTarget = 'sfx'; });

    const onPointerUp = () => { dragTarget = null; };
    const onPointerMove = (pointer) => {
        if (!dragTarget || !audioManager) return;
        const sliderCenterX = centerX + 40;
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

    // Keyboard shortcuts
    scene.menuKeyHandler = () => {
        if (scene.isRebindingKey) return;
        returnToMainMenu(scene);
    };
    scene.input.keyboard.on('keydown-M', scene.menuKeyHandler);
    
    scene.keyMapHandler = () => {
        if (scene.isRebindingKey) return;
        if (scene.pauseMenuView === 'main') {
            showKeyBindings();
        } else {
            showMainMenu();
        }
    };
    scene.input.keyboard.on('keydown-K', scene.keyMapHandler);
    
    scene.escHandler = () => {
        if (scene.isRebindingKey) {
            cancelRebind();
        } else if (scene.pauseMenuView === 'keybindings') {
            showMainMenu();
        }
    };
    scene.input.keyboard.on('keydown-ESC', scene.escHandler);
}

function cleanupPauseUI(scene) {
    if (scene.pauseUI) {
        const { overlay, mainElements, keyBindingsElements, keyMapValueTexts } = scene.pauseUI;
        
        if (overlay) overlay.destroy();
        
        if (mainElements) {
            mainElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        
        if (keyBindingsElements) {
            keyBindingsElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        
        if (keyMapValueTexts) {
            keyMapValueTexts.forEach(({ text }) => {
                if (text && text.destroy) text.destroy();
            });
        }
        
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
    
    if (scene.menuKeyHandler) {
        scene.input.keyboard.off('keydown-M', scene.menuKeyHandler);
        scene.menuKeyHandler = null;
    }
    
    if (scene.keyMapHandler) {
        scene.input.keyboard.off('keydown-K', scene.keyMapHandler);
        scene.keyMapHandler = null;
    }
    
    if (scene.escHandler) {
        scene.input.keyboard.off('keydown-ESC', scene.escHandler);
        scene.escHandler = null;
    }
    
    scene.isRebindingKey = false;
    scene.rebindingAction = null;
    scene.pauseMenuView = null;
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