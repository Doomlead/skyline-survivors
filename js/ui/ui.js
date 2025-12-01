// ------------------------
// UI and HUD
// ------------------------

let scoreEl, waveEl, timerEl, bombsEl, livesEl, powerupsEl;
let radarCanvas, radarCtx;

function createUI(scene) {
    // Get references to DOM elements created in index.html
    scoreEl = document.getElementById('score-el');
    waveEl = document.getElementById('wave-el');
    timerEl = document.getElementById('timer-el');
    bombsEl = document.getElementById('bombs-el');
    livesEl = document.getElementById('lives-el');
    powerupsEl = document.getElementById('powerups-el');
    
    radarCanvas = document.getElementById('radar-canvas');
    if (radarCanvas) {
        radarCtx = radarCanvas.getContext('2d');
    }
}

function updateUI() {
    if (!scoreEl) return;

    scoreEl.innerText = gameState.score.toString().padStart(6, '0');

    if (gameState.mode === 'survival') {
        const activeHumans = humans ? humans.countActive(true) : gameState.humans;
        waveEl.style.display = 'block';
        waveEl.innerText = 'HUMANS: ' + String(activeHumans).padStart(3, '0');

        timerEl.style.display = 'block';
        const t = Math.max(0, gameState.timeRemaining);
        const mins = Math.floor(t / 60000).toString().padStart(2, '0');
        const secs = Math.floor((t % 60000) / 1000).toString().padStart(2, '0');
        timerEl.innerText = `TIME: ${mins}:${secs}`;
    } else {
        // Classic mode
        timerEl.style.display = 'none';
        waveEl.style.display = 'block';
        
        const enemiesLeft = Math.max(0, (gameState.enemiesToKillThisWave || 0) - (gameState.killsThisWave || 0));
        waveEl.innerText = 'WAVE ' + gameState.wave + '  ENEMIES: ' + String(enemiesLeft).padStart(3, '0');
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
}

function updateRadar(scene) {
    if (!radarCtx || !player) return;
    
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
    gameState.gameOver = true;
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
        `Final Score: ${gameState.score}\nHumans Rescued: ${gameState.humansRescued}`, {
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
    gameState.gameOver = true;
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
        `Victory!\nFinal Score: ${gameState.score}`, {
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

function togglePause(scene) {
    gameState.paused = !gameState.paused;
    
    if (gameState.paused) {
        scene.physics.pause();
        
        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2;
        
        const overlay = scene.add.rectangle(centerX, centerY, CONFIG.width, CONFIG.height, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(998).setInteractive();
            
        const pauseTitle = scene.add.text(centerX, centerY - 80, 'PAUSED', {
            fontSize: '48px', fontFamily: 'Orbitron', color: '#00ffff', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
        
        const resumeText = scene.add.text(centerX - 120, centerY - 20, '[ P ] RESUME', {
            fontSize: '20px', fontFamily: 'Orbitron', color: '#00ff00', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(999).setInteractive({ useHandCursor: true });
        
        const menuText = scene.add.text(centerX + 120, centerY - 20, '[ M ] MAIN MENU', {
            fontSize: '20px', fontFamily: 'Orbitron', color: '#ffff00', stroke: '#000000', strokeThickness: 4
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

        scene.pauseUI = { 
            overlay, pauseTitle, resumeText, menuText, 
            volumeTitle, musicLabel, musicSlider, musicKnob, sfxLabel, sfxSlider, sfxKnob 
        };

        resumeText.on('pointerdown', () => togglePause(scene));
        menuText.on('pointerdown', () => returnToMainMenu(scene));
        
        let dragTarget = null;
        musicKnob.on('pointerdown', () => { dragTarget = 'music'; });
        sfxKnob.on('pointerdown', () => { dragTarget = 'sfx'; });
        
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
        scene.menuKeyHandler = () => returnToMainMenu(scene);
        scene.input.keyboard.once('keydown-M', scene.menuKeyHandler);

    } else {
        scene.physics.resume();
        cleanupPauseUI(scene);
    }
}

function cleanupPauseUI(scene) {
    if (scene.pauseUI) {
        Object.values(scene.pauseUI).forEach(el => el.destroy());
        scene.pauseUI = null;
    }
    if (scene.pauseHandlers) {
        scene.input.off('pointerup', scene.pauseHandlers.onPointerUp);
        scene.input.off('pointermove', scene.pauseHandlers.onPointerMove);
        scene.pauseHandlers = null;
    }
    if (scene.menuKeyHandler) {
        scene.input.keyboard.off('keydown-M', scene.menuKeyHandler);
        scene.menuKeyHandler = null;
    }
}

function returnToMainMenu(scene) {
    cleanupPauseUI(scene);
    resetGameState();
    const menu = document.getElementById('menu-overlay');
    if (menu) menu.style.display = 'flex';
    scene.scene.restart();
}
