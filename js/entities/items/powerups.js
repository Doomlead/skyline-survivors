// ------------------------
// Power-up system - All 16 power-up types
// ------------------------

function spawnPowerUp(scene, x, y) {
    const { powerUps } = scene;
    if (!powerUps) return;
    const powerUpPool = [
        'laser','drone','shield','missile','overdrive','rear','side','rapid','multiShot','piercing','speed','magnet','bomb','double','invincibility','timeSlow'
    ];
    const type = Phaser.Utils.Array.GetRandom(powerUpPool);
    const powerUp = powerUps.create(x, y, 'powerup_' + type);
    powerUp.setScale(1.25);
    powerUp.setDepth(FG_DEPTH_BASE + 3); // Keep collectibles on the gameplay layer or above
    powerUp.powerUpType = type;
    powerUp.birthTime = scene.time.now;
    scene.tweens.add({
        targets: powerUp,
        y: y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    scene.time.delayedCall(30000, () => {
        if (powerUp && powerUp.active) powerUp.destroy();
    });
}

function updatePowerUps(scene) {
    const { powerUps, player } = scene;
    if (!powerUps || !player) return;
    powerUps.children.entries.forEach(powerUp => {
        wrapWorldBounds(powerUp);
        if (playerState.powerUps.magnet > 0) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, powerUp.x, powerUp.y);
            if (dist < 150) {
                const angle = Phaser.Math.Angle.Between(powerUp.x, powerUp.y, player.x, player.y);
                const speed = 300;
                powerUp.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
            }
        } else {
            powerUp.setVelocity(0, 0);
        }
    });
}


function collectPowerUp(playerSprite, powerUp) {
    gameState.score += getMissionScaledReward(200);
    const audioManager = this.audioManager;
    if (audioManager) audioManager.playSound('powerUpCollect');
    const p = playerState.powerUps;
    const powerUpNames = {
        laser: 'LASER UPGRADE',
        drone: 'FORCE DRONE',
        shield: 'SHIELD',
        missile: 'HOMING MISSILES',
        overdrive: 'OVERDRIVE',
        rear: 'REAR SHOT',
        side: 'SIDE SHOT',
        rapid: 'RAPID FIRE',
        multiShot: 'MULTI-SHOT',
        piercing: 'PIERCING SHOTS',
        speed: 'SPEED BOOST',
        magnet: 'POWER MAGNET',
        bomb: 'SMART BOMB',
        double: 'DOUBLE DAMAGE',
        invincibility: 'INVINCIBILITY',
        timeSlow: 'TIME SLOW'
    };

    const nameText = this.add.text(
        powerUp.x,
        powerUp.y - 20,
        powerUpNames[powerUp.powerUpType] || 'POWER-UP',
        {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3
        }
    ).setOrigin(0.5);

    this.tweens.add({
        targets: nameText,
        y: powerUp.y - 50,
        alpha: 0,
        duration: 1500,
        onComplete: () => nameText.destroy()
    });

    switch (powerUp.powerUpType) {
        case 'laser':
            p.laser = Math.min((p.laser || 0) + 1, 2);
            break;
        case 'drone': {
            p.drone = Math.min((p.drone || 0) + 1, 3);
            const drone = this.drones.create(playerSprite.x, playerSprite.y, 'forceDrone');
            drone.setScale(1.25);
            drone.setDepth(FG_DEPTH_BASE + 8);
            break;
        }
        case 'shield':
            p.shield = 1;
            break;
        case 'missile':
            p.missile = Math.min((p.missile || 0) + 1, 3);
            break;
        case 'overdrive':
            p.overdrive = 10000;
            playerState.fireRate = 50;
            break;
        case 'rear':
            p.coverage = Math.min((p.coverage || 0) + 1, 2);
            break;
        case 'side':
            p.coverage = Math.min((p.coverage || 0) + 1, 2);
            break;
        case 'rapid':
            p.rapid = 10000;
            playerState.fireRate = 80;
            break;
        case 'multiShot':
            p.multiShot = Math.min((p.multiShot || 0) + 1, 3);
            break;
        case 'piercing':
            p.piercing = 1;
            p.laser = Math.max(p.laser || 0, 1);
            break;
        case 'speed':
            p.speed = 10000;
            break;
        case 'magnet':
            p.magnet = 10000;
            break;
        case 'bomb':
            gameState.smartBombs = Math.min(gameState.smartBombs + 1, 9);
            break;
        case 'double':
            p.double = 10000;
            break;
        case 'invincibility':
            p.invincibility = 5000;
            break;
        case 'timeSlow':
            p.timeSlow = 8000;
            break;
    }

    createPowerUpCollectionEffect(this, powerUp.x, powerUp.y, powerUp.powerUpType);
    powerUp.destroy();
}

function updatePowerUpMagnet(scene) {
    const { powerUps } = scene;
    const player = getActivePlayer(scene);
    if (!powerUps || !player) return;
    if (playerState.powerUps.magnet <= 0) return;
    const magnetRadius = 150;
    powerUps.children.entries.forEach(powerUp => {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, powerUp.x, powerUp.y);
        if (dist < magnetRadius) {
            const angle = Phaser.Math.Angle.Between(powerUp.x, powerUp.y, player.x, player.y);
            const speed = 300;
            powerUp.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    });
}


function updatePowerUpTimers(scene, delta) {
    const player = getActivePlayer(scene);
    if (!player) return;
    let minFireRate = 200;
    if (playerState.powerUps.overdrive > 0) {
        playerState.powerUps.overdrive -= delta;
        if (playerState.powerUps.overdrive <= 0) {
            playerState.powerUps.overdrive = 0;
        } else {
            minFireRate = Math.min(minFireRate, 50);
        }
    }
    if (playerState.powerUps.rapid > 0) {
        playerState.powerUps.rapid -= delta;
        if (playerState.powerUps.rapid <= 0) {
            playerState.powerUps.rapid = 0;
        } else {
            minFireRate = Math.min(minFireRate, 80);
        }
    }
    playerState.fireRate = minFireRate;
    if (playerState.powerUps.shield > 0 && player.shieldSprite) {
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.5;
        player.shieldSprite.setAlpha(pulse);
    }
    if (playerState.powerUps.speed > 0) {
        playerState.powerUps.speed -= delta;
        if (playerState.powerUps.speed <= 0) playerState.powerUps.speed = 0;
    }
    if (playerState.powerUps.magnet > 0) {
        playerState.powerUps.magnet -= delta;
        if (playerState.powerUps.magnet <= 0) playerState.powerUps.magnet = 0;
    }
    if (playerState.powerUps.double > 0) {
        playerState.powerUps.double -= delta;
        if (playerState.powerUps.double <= 0) playerState.powerUps.double = 0;
    }
    if (playerState.powerUps.invincibility > 0) {
        playerState.powerUps.invincibility -= delta;
        player.setAlpha(Math.sin(Date.now() * 0.01) * 0.5 + 0.5);
        if (playerState.powerUps.invincibility <= 0) {
            playerState.powerUps.invincibility = 0;
            player.setAlpha(1);
        }
    }
    if (playerState.powerUps.timeSlow > 0) {
        playerState.powerUps.timeSlow -= delta;
        if (playerState.powerUps.timeSlow <= 0) playerState.powerUps.timeSlow = 0;
    }
}
