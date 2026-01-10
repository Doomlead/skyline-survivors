// ------------------------
// Boss AI Behaviors and Update Functions
// ------------------------

function updateMegaLanderBehavior(scene, boss, time, timeSlowMultiplier) {
    // Circular orbit pattern around screen center
    if (!boss.orbitAngle) boss.orbitAngle = 0;
    boss.orbitAngle += 0.005 * timeSlowMultiplier;
    
    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const centerY = CONFIG.height / 2;
    const orbitRadius = 150;
    
    boss.x = centerX + Math.cos(boss.orbitAngle) * orbitRadius;
    boss.y = centerY + Math.sin(boss.orbitAngle) * orbitRadius * 0.6;
    
    // Shoot from 4 tentacles
    if (time > boss.lastShot + 1200) {
        const shotConfig = getBossShotConfig('megaLander');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(angle) * 30;
            const sourceY = boss.y + Math.sin(angle) * 30;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig);
        }
        boss.lastShot = time;
    }
}

function updateTitanMutantBehavior(scene, boss, time, timeSlowMultiplier) {
    // Aggressive pursuit with erratic wobble
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const wobble = Math.sin(time * 0.008) * 0.3;
    const speed = 80 * timeSlowMultiplier;
    
    boss.setVelocity(
        Math.cos(angle + wobble) * speed,
        Math.sin(angle + wobble) * speed
    );
    
    // 3 arm shooting - spread pattern
    if (time > boss.lastShot + 1400) {
        const shotConfig = getBossShotConfig('titanMutant');
        for (let i = 0; i < 3; i++) {
            const armAngle = angle + (i - 1) * 0.4;
            const sourceX = boss.x + Math.cos(armAngle) * 40;
            const sourceY = boss.y + Math.sin(armAngle) * 40;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, armAngle);
        }
        boss.lastShot = time;
    }
}

function updateHiveDroneBehavior(scene, boss, time, timeSlowMultiplier) {
    // Hovering patrol with slow vertical bob
    if (!boss.hoverY) boss.hoverY = boss.y;
    boss.hoverY += Math.sin(time * 0.003) * 0.5;
    
    boss.y = Phaser.Math.Clamp(boss.hoverY, 100, CONFIG.worldHeight - 100);
    
    if (boss.x < scene.cameras.main.scrollX + 100) {
        boss.setVelocityX(50 * timeSlowMultiplier);
    } else if (boss.x > scene.cameras.main.scrollX + CONFIG.width - 100) {
        boss.setVelocityX(-50 * timeSlowMultiplier);
    } else {
        boss.setVelocityX(0);
    }
    
    // 6 hexagonal gun ports fire
    if (time > boss.lastShot + 1000) {
        const shotConfig = getBossShotConfig('hiveDrone');
        for (let i = 0; i < 6; i++) {
            const portAngle = (i / 6) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(portAngle) * 35;
            const sourceY = boss.y + Math.sin(portAngle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, portAngle);
        }
        boss.lastShot = time;
    }
}

function updateBehemothBomberBehavior(scene, boss, time, delta, timeSlowMultiplier) {
    const enemyProjectiles = scene.enemyProjectiles;
    if (!enemyProjectiles) return;
    // Slow horizontal patrol
    if (!boss.bomberDirection) {
        boss.bomberDirection = Math.random() < 0.5 ? -1 : 1;
        boss.lastBombDrop = 0;
    }
    
    boss.setVelocityX(40 * boss.bomberDirection * timeSlowMultiplier);
    
    // Keep in middle height
    if (boss.y < CONFIG.height * 0.3) boss.setVelocityY(30 * timeSlowMultiplier);
    else if (boss.y > CONFIG.height * 0.7) boss.setVelocityY(-30 * timeSlowMultiplier);
    
    // Drop mines from 3 bomb bays + 2 side shots
    if (time > boss.lastBombDrop + 2000) {
        // 3 bomb bays - drop mines downward
        for (let i = 0; i < 3; i++) {
            const bayX = boss.x + (i - 1) * 30;
            const mine = enemyProjectiles.create(bayX, boss.y + 20, 'mine');
            mine.setDepth(FG_DEPTH_BASE + 4);
            mine.setScale(1.5);
            mine.setVelocityY(80);
            mine.isMine = true;
            mine.enemyType = 'behemothBomber';
            
            scene.tweens.add({
                targets: mine,
                rotation: Math.PI * 2,
                duration: 1000,
                repeat: -1
            });
            
            scene.time.delayedCall(5000, () => {
                if (mine && mine.active) mine.destroy();
            });
        }
        
        // 2 side guns - lateral shots
        const shotConfig = getBossShotConfig('behemothBomber');
        shootFromBossSource(scene, boss.x - 40, boss.y, boss, shotConfig, Math.PI);
        shootFromBossSource(scene, boss.x + 40, boss.y, boss, shotConfig, 0);
        
        boss.lastBombDrop = time;
    }
}

function updateColossalPodBehavior(scene, boss, time, timeSlowMultiplier) {
    // Slow sinuous movement
    if (!boss.podPattern) boss.podPattern = 0;
    boss.podPattern += 0.015 * timeSlowMultiplier;
    
    const baseY = CONFIG.height / 2;
    boss.y = baseY + Math.sin(boss.podPattern) * 80;
    
    // Drift horizontally
    boss.setVelocityX(30 * timeSlowMultiplier);
    
    // 4 spawn ports radial fire
    if (time > boss.lastShot + 1500) {
        const shotConfig = getBossShotConfig('colossalPod');
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(angle) * 40;
            const sourceY = boss.y + Math.sin(angle) * 40;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, angle);
        }
        boss.lastShot = time;
    }
}

function updateLeviathanBaiterBehavior(scene, boss, time, timeSlowMultiplier) {
    // Serpentine weaving pattern
    const player = getActivePlayer(scene);
    if (!player) return;
    if (!boss.serpentinePhase) boss.serpentinePhase = 0;
    boss.serpentinePhase += 0.02 * timeSlowMultiplier;
    
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const weave = Math.sin(boss.serpentinePhase) * 0.5;
    const speed = 100 * timeSlowMultiplier;
    
    boss.setVelocity(
        Math.cos(angle + weave) * speed,
        Math.sin(angle + weave) * speed
    );
    
    // 5 thrusters fire in quick sequence
    if (time > boss.lastShot + 900) {
        const shotConfig = getBossShotConfig('leviathanBaiter');
        for (let i = 0; i < 5; i++) {
            const thrusterAngle = (i / 5) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(thrusterAngle) * 35;
            const sourceY = boss.y + Math.sin(thrusterAngle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, thrusterAngle - Math.PI);
        }
        boss.lastShot = time;
    }
}

function updateApexKamikazeBehavior(scene, boss, time, timeSlowMultiplier) {
    // Aggressive suicide charge
    const player = getActivePlayer(scene);
    if (!player) return;
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
    const speed = 150 * timeSlowMultiplier;
    
    boss.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    
    // Erratic spins
    boss.rotation += 0.1 * timeSlowMultiplier;
    
    // 4 explosive appendages burst fire
    if (time > boss.lastShot + 800) {
        const shotConfig = getBossShotConfig('apexKamikaze');
        for (let i = 0; i < 4; i++) {
            const appendageAngle = (i / 4) * Math.PI * 2 + (time * 0.005);
            const sourceX = boss.x + Math.cos(appendageAngle) * 25;
            const sourceY = boss.y + Math.sin(appendageAngle) * 25;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, appendageAngle);
        }
        boss.lastShot = time;
    }
}

function updateFortressTurretBehavior(scene, boss, time, timeSlowMultiplier) {
    const enemyProjectiles = scene.enemyProjectiles;
    const audioManager = scene.audioManager;
    if (!enemyProjectiles) return;
    // Stationary - plant if not already
    if (!boss.isPlanted) {
        boss.isPlanted = true;
        boss.setVelocity(0, 0);
        boss.body.setImmovable(true);
        boss.rotation = 0;
        boss.barrelMode = 0;
    }
    
    // 8 barrel rotating pattern
    if (time > boss.lastShot + 1100) {
        let directions;
        
        if (boss.barrelMode === 0) {
            // Cardinal + diagonal (8 directions)
            directions = [
                -Math.PI / 2,      // Up
                -Math.PI / 4,      // Up-Right
                0,                 // Right
                Math.PI / 4,       // Down-Right
                Math.PI / 2,       // Down
                3 * Math.PI / 4,   // Down-Left
                Math.PI,           // Left
                -3 * Math.PI / 4   // Up-Left
            ];
        } else {
            // Offset by 22.5 degrees
            directions = [];
            for (let i = 0; i < 8; i++) {
                directions.push((i / 8) * Math.PI * 2 + Math.PI / 8);
            }
        }
        
        directions.forEach(dir => {
            const sourceX = boss.x + Math.cos(dir) * 40;
            const sourceY = boss.y + Math.sin(dir) * 40;
            
            const proj = enemyProjectiles.create(sourceX, sourceY, 'enemyProjectile');
            proj.setDepth(FG_DEPTH_BASE + 4);
            proj.setScale(1.5);
            proj.setVelocity(Math.cos(dir) * 250, Math.sin(dir) * 250);
            proj.rotation = dir;
            proj.damage = 1.3;
            
            scene.time.delayedCall(3000, () => {
                if (proj && proj.active) proj.destroy();
            });
        });
        
        boss.rotation += Math.PI / 8;
        boss.lastShot = time;
        boss.barrelMode = (boss.barrelMode + 1) % 2;
        if (audioManager) audioManager.playSound('enemyShoot');
    }
}

function updateOverlordShieldBehavior(scene, boss, time, timeSlowMultiplier) {
    // Slow, deliberate orbital movement
    if (!boss.orbitAngle) boss.orbitAngle = 0;
    boss.orbitAngle += 0.003 * timeSlowMultiplier;
    
    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const centerY = CONFIG.height / 2;
    const orbitRadius = 120;
    
    boss.x = centerX + Math.cos(boss.orbitAngle) * orbitRadius;
    boss.y = centerY + Math.sin(boss.orbitAngle) * orbitRadius * 0.8;
    
    // 6 energy nodes fire slow, powerful beams
    if (time > boss.lastShot + 1800) {
        const shotConfig = getBossShotConfig('overlordShield');
        for (let i = 0; i < 6; i++) {
            const nodeAngle = (i / 6) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(nodeAngle) * 45;
            const sourceY = boss.y + Math.sin(nodeAngle) * 45;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, nodeAngle);
        }
        boss.lastShot = time;
    }
}

function updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier) {
    const player = getActivePlayer(scene);
    const centerX = scene.cameras.main.scrollX + CONFIG.width / 2;
    const targetY = CONFIG.height * 0.35;
    const sway = Math.sin(time * 0.0015) * 120;

    boss.x = Phaser.Math.Linear(boss.x, centerX + sway, 0.02);
    boss.y = Phaser.Math.Linear(boss.y, targetY + Math.sin(time * 0.001) * 25, 0.02);

    const hpRatio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    const phase = hpRatio < 0.33 ? 2 : hpRatio < 0.66 ? 1 : 0;
    boss.corePhase = phase;

    const shotInterval = phase === 2 ? 900 : phase === 1 ? 1200 : 1600;
    if (time > boss.lastShot + shotInterval) {
        const shotConfig = getBossShotConfig('mothershipCore');
        const ringCount = phase === 2 ? 10 : phase === 1 ? 8 : 6;
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const sourceX = boss.x + Math.cos(angle) * 50;
            const sourceY = boss.y + Math.sin(angle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, angle);
        }
        if (player && phase > 0) {
            const aimedAngle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
            const sourceX = boss.x + Math.cos(aimedAngle) * 55;
            const sourceY = boss.y + Math.sin(aimedAngle) * 35;
            shootFromBossSource(scene, sourceX, sourceY, boss, shotConfig, aimedAngle);
        }
        boss.lastShot = time;
    }
}

function updateBosses(scene, time, delta) {
    const topLimit = 20;
    const { bosses } = scene;
    if (!bosses) return;

    bosses.children.entries.forEach(boss => {
        wrapWorldBounds(boss);
        
        const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
        const terrainVariation = Math.sin(boss.x / 200) * 30;
        const minClearance = 60;
        const bossGroundY = groundLevel - terrainVariation - minClearance;
        
        if (boss.y > bossGroundY) {
            boss.y = bossGroundY;
            if (boss.body.velocity.y > 0) boss.setVelocityY(0);
        }
        if (boss.y < topLimit) {
            boss.y = topLimit;
            if (boss.body.velocity.y < 0) boss.setVelocityY(0);
        }

        const timeSlowMultiplier = playerState.powerUps.timeSlow > 0 ? 0.3 : 1.0;

        switch (boss.bossType) {
            case 'megaLander':
                updateMegaLanderBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'titanMutant':
                updateTitanMutantBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'hiveDrone':
                updateHiveDroneBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'behemothBomber':
                updateBehemothBomberBehavior(scene, boss, time, delta, timeSlowMultiplier);
                break;
            case 'colossalPod':
                updateColossalPodBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'leviathanBaiter':
                updateLeviathanBaiterBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'apexKamikaze':
                updateApexKamikazeBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'fortressTurret':
                updateFortressTurretBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'overlordShield':
                updateOverlordShieldBehavior(scene, boss, time, timeSlowMultiplier);
                break;
            case 'mothershipCore':
                updateMothershipCoreBehavior(scene, boss, time, timeSlowMultiplier);
                break;
        }
    });
}
