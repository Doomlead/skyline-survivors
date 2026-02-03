// ------------------------
// file: js/entities/player/playerCore.js
// ------------------------

function getActivePlayer(scene) {
    return veritechState.active ? scene.veritech : scene.pilot;
}

function syncActivePlayer(scene) {
    scene.player = getActivePlayer(scene);
    return scene.player;
}

function setVeritechMode(scene, mode) {
    veritechState.mode = mode;
    const texture = mode === 'guardian' ? 'veritech_guardian' : 'veritech_fighter';
    if (scene.veritech) {
        scene.veritech.setTexture(texture);
        if (mode === 'guardian') {
            scene.veritech.body.setSize(22, 28);
        } else {
            scene.veritech.body.setSize(28, 12);
        }
    }
}

function ejectPilot(scene) {
    if (!scene.veritech || !scene.pilot || !veritechState.active) return;
    veritechState.active = false;
    pilotState.active = true;
    pilotState.grounded = false;
    pilotState.vx = veritechState.vx * 0.5;
    pilotState.vy = -120;
    pilotState.facing = veritechState.facing;
    scene.pilot.setPosition(scene.veritech.x, scene.veritech.y);
    scene.pilot.setActive(true).setVisible(true);
    scene.pilot.body.enable = true;
    scene.veritech.body.enable = false;
    scene.veritech.setAlpha(1);
    if (scene.veritech.shieldSprite) {
        scene.veritech.shieldSprite.destroy();
        scene.veritech.shieldSprite = null;
    }
    syncActivePlayer(scene);
}

function enterVeritech(scene) {
    if (!scene.veritech || !scene.pilot || !pilotState.active) return;
    if (veritechState.destroyed) return;
    const dist = Phaser.Math.Distance.Between(scene.pilot.x, scene.pilot.y, scene.veritech.x, scene.veritech.y);
    if (dist > 60) return;
    pilotState.active = false;
    veritechState.active = true;
    pilotState.vx = 0;
    pilotState.vy = 0;
    scene.pilot.setActive(false).setVisible(false);
    scene.pilot.body.enable = false;
    scene.veritech.body.enable = true;
    scene.pilot.setAlpha(1);
    if (scene.pilot.shieldSprite) {
        scene.pilot.shieldSprite.destroy();
        scene.pilot.shieldSprite = null;
    }
    syncActivePlayer(scene);
}

function playerDie(scene) {
    const { particleManager, audioManager, drones } = scene;
    const player = getActivePlayer(scene);
    if (!player) return;
    if (scene._isRespawning || gameState.gameOver) return;
    const isVeritechActive = veritechState.active || player === scene.veritech;
    if (particleManager) {
        if (audioManager) audioManager.playSound('explosion');
        particleManager.playerExplosion(player.x, player.y);
    } else {
        createExplosion(scene, player.x, player.y);
    }
    screenShake(scene, 20, 500);

    if (isVeritechActive) {
        veritechState.destroyed = true;
        if (scene.veritech) {
            scene.veritech.setActive(false).setVisible(false);
            scene.veritech.body.enable = false;
        }
        ejectPilot(scene);
        if (gameState.rebuildObjective) {
            gameState.rebuildObjective.active = true;
            gameState.rebuildObjective.stage = 'secure_extraction';
            gameState.rebuildObjective.timer = 0;
            gameState.rebuildObjective.encounterSpawned = false;
            gameState.rebuildObjective.extractionX = scene.pilot ? scene.pilot.x : player.x;
            gameState.rebuildObjective.extractionY = scene.pilot ? scene.pilot.y : player.y;
            gameState.rebuildObjective.branch = gameState.rebuildObjective.branch || 'dropship';
            gameState.rebuildObjective.requiredAlienTech = gameState.rebuildObjective.branch === 'station' ? 3 : 0;
            gameState.rebuildObjective.collectedAlienTech = 0;
            gameState.rebuildObjective.shipReturned = false;
            gameState.rebuildObjective.hangarRebuildTimer = 0;
        }
        playerState.powerUps.invincibility = 1500;
        return;
    }

    gameState.lives--;
    if (gameState.lives <= 0) {
        gameOver(scene);
    } else {
        scene._isRespawning = true;
        player.setActive(false).setVisible(false);
        player.body.enable = false;
        pilotState.active = false;
        veritechState.active = true;

        const p = playerState.powerUps;
        const weaponKeys = ['laser','drone','shield','missile','overdrive','coverage','rapid','multiShot','piercing','speed','magnet','double','timeSlow'];
        const activeWeapons = weaponKeys.filter(k => p[k] && p[k] > 0);
        const toRemove = Math.ceil(activeWeapons.length / 2);
        Phaser.Utils.Array.Shuffle(activeWeapons);
        for (let i = 0; i < toRemove; i++) {
            const key = activeWeapons[i];
            if (key) {
                p[key] = 0;
                if (playerState.powerUpDecay && playerState.powerUpDecay[key] !== undefined) {
                    playerState.powerUpDecay[key] = 0;
                }
            }
        }
        if (playerState.powerUpDecay) {
            if (!p.coverage) playerState.powerUpDecay.coverage = 0;
            if (!p.missile) playerState.powerUpDecay.missile = 0;
        }
        if (playerState.primaryWeapon === 'laser' && p.laser <= 0 && p.multiShot > 0) {
            playerState.primaryWeapon = 'multiShot';
        } else if (playerState.primaryWeapon === 'multiShot' && p.multiShot <= 0 && p.laser > 0) {
            playerState.primaryWeapon = 'laser';
        }
        p.invincibility = 0;
        if (!p.overdrive && !p.rapid) playerState.fireRate = 200;
        drones.clear(true);
        if (player.shieldSprite) {
            player.shieldSprite.destroy();
            player.shieldSprite = null;
        }

        scene.time.delayedCall(1000, () => {
            setVeritechMode(scene, 'fighter');
            veritechState.destroyed = false;
            scene.veritech.x = 100;
            scene.veritech.y = 300;
            scene.veritech.setActive(true).setVisible(true);
            scene.veritech.body.enable = true;
            scene.pilot.setActive(false).setVisible(false);
            scene.pilot.body.enable = false;
            playerState.powerUps.invincibility = 2000;
            scene._isRespawning = false;
        });
    }
}
