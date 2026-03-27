// ------------------------
// file: js/entities/player/playerControls.js
// ------------------------

// Main per-frame player input/movement/combat update for AEGIS and pilot control states.
function updatePlayer(scene, time, delta) {
    const {
        aegis,
        pilot,
        leftKey,
        rightKey,
        upKey,
        downKey,
        fireKey,
        transformKey,
        jumpKey,
        bombKey,
        ejectKey,
        enterKey,
        hyperspaceKey,
        pauseKey,
        switchPrimaryKey,
        particleManager,
        audioManager
    } = scene;
    if (!aegis || !leftKey || !rightKey || !upKey || !downKey) return;

    const vInput = window.virtualInput || { left: false, right: false, up: false, down: false, fire: false };
    const gamepadState = getGamepadInputState(scene);
    const left = leftKey.isDown || vInput.left || gamepadState.left;
    const right = rightKey.isDown || vInput.right || gamepadState.right;
    const up = upKey.isDown || vInput.up || gamepadState.up;
    const down = downKey.isDown || vInput.down || gamepadState.down;

    if (aegisState.transformCooldown > 0) {
        aegisState.transformCooldown -= delta;
    }

    const shipLocked = (gameState.mode === 'mothership' && gameState?.mothershipObjective?.shipLocked)
        || (gameState.mode === 'assault' && gameState?.assaultObjective?.shipLocked);

    if ((isKeyOrGamepadJustPressed(transformKey, gamepadState.transformPressed)) && aegisState.active && !shipLocked && aegisState.transformCooldown <= 0) {
        const nextMode = aegisState.mode === 'interceptor' ? 'bulwark' : 'interceptor';
        setAegisMode(scene, nextMode);
        aegisState.transformCooldown = 350;
    }

    if (ejectKey && isKeyOrGamepadJustPressed(ejectKey, gamepadState.ejectPressed) && aegisState.active && !shipLocked) {
        ejectPilot(scene);
    }

    if (enterKey && isKeyOrGamepadJustPressed(enterKey, gamepadState.enterPressed) && pilotState.active && !shipLocked) {
        enterAegis(scene);
    }

    if (isKeyOrGamepadJustPressed(bombKey, gamepadState.bombPressed)) useSmartBomb(scene);
    if (isKeyOrGamepadJustPressed(hyperspaceKey, gamepadState.hyperspacePressed)) useHyperspace(scene);
    if (isKeyOrGamepadJustPressed(pauseKey, gamepadState.pausePressed)) togglePause(scene);
    if (isKeyOrGamepadJustPressed(switchPrimaryKey, gamepadState.switchPrimaryPressed)) {
        if (pilotState.active && typeof cyclePilotWeapon === 'function') {
            cyclePilotWeapon();
        } else {
            const p = playerState.powerUps;
            if (p.laser > 0 && p.multiShot > 0) {
                playerState.primaryWeapon = playerState.primaryWeapon === 'laser' ? 'multiShot' : 'laser';
            } else if (p.laser > 0) {
                playerState.primaryWeapon = 'laser';
            } else if (p.multiShot > 0) {
                playerState.primaryWeapon = 'multiShot';
            }
        }
    }

    const groundLevel = scene.groundLevel || CONFIG.worldHeight - 80;
    const minY = 20;
    const interiorPlatformsActive = Boolean(scene.interiorPlatformsActive && scene.platforms);

    if (aegisState.active) {
        const speed = aegisState.mode === 'interceptor' ? 320 : 220;
        const horizontalSpeed = speed * 0.4;
        const baseAccel = aegisState.mode === 'interceptor' ? 0.18 : 0.2;
        const baseDrag = aegisState.mode === 'interceptor' ? 0.92 : 0.9;
        const cargoCount = window.ShipController?.cargo ?? 0;
        const accelPenalty = Math.min(0.45, cargoCount * 0.06);
        const accel = baseAccel * (1 - accelPenalty);
        const dragBoost = Math.min(0.06, cargoCount * 0.01);
        const drag = Math.min(0.98, baseDrag + dragBoost);
        const gravity = aegisState.mode === 'bulwark' ? 520 : 0;

        if (left) {
            aegisState.vx -= horizontalSpeed * accel;
            aegisState.facing = -1;
        } else if (right) {
            aegisState.vx += horizontalSpeed * accel;
            aegisState.facing = 1;
        }

        if (aegisState.mode === 'interceptor') {
            if (up) aegisState.vy -= speed * accel;
            if (down) aegisState.vy += speed * accel;
        } else {
            if (up) aegisState.vy -= speed * accel * 1.2;
            if (down) aegisState.vy += speed * accel * 0.7;
            aegisState.vy += gravity * (delta / 1000);
        }

        aegisState.vx *= drag;
        aegisState.vy *= drag;

        const maxSpeed = speed * 1.1;
        const maxHorizontalSpeed = horizontalSpeed * 1.1;
        aegisState.vx = Phaser.Math.Clamp(aegisState.vx, -maxHorizontalSpeed, maxHorizontalSpeed);
        aegisState.vy = Phaser.Math.Clamp(aegisState.vy, -maxSpeed, maxSpeed);

        aegis.x += aegisState.vx * (delta / 1000);
        aegis.y += aegisState.vy * (delta / 1000);
        aegis.body.setVelocity(aegisState.vx, aegisState.vy);

        const terrainVariation = Math.sin(aegis.x / 200) * 30;
        const maxY = groundLevel - terrainVariation - 20;
        if (aegis.y < minY) aegis.y = minY;
        if (aegis.y > maxY) {
            aegis.y = maxY;
            aegisState.vy = 0;
        }

        if (aegisState.mode === 'bulwark') {
            aegisState.aimAngle = getBulwarkAimAngle(left, right, up, down);
        }

        aegis.flipX = aegisState.facing < 0;
        playerState.direction = aegisState.facing < 0 ? 'left' : 'right';
        syncActivePlayer(scene);
    } else if (pilotState.active) {
        const speed = 200;
        const horizontalSpeed = speed * 0.65;
        const jumpForce = -320;
        const gravity = 900;

        if (interiorPlatformsActive) {
            const climbSpeed = 150;
            const onLadder = findInteriorNearbyLadder(scene, pilot);

            if (onLadder && (up || down)) {
                pilotState.climbing = true;
                pilotState.vy = 0;
                pilot.body.setAllowGravity(false);

                if (up) {
                    pilot.y -= climbSpeed * (delta / 1000);
                    if (pilot.y <= onLadder.topY) {
                        pilotState.climbing = false;
                        pilot.body.setAllowGravity(true);
                        pilotState.vy = -100;
                    }
                } else if (down) {
                    pilot.y += climbSpeed * (delta / 1000);
                    if (pilot.y >= onLadder.bottomY) {
                        pilotState.climbing = false;
                        pilot.body.setAllowGravity(true);
                    }
                }

                pilotState.vx = 0;
                if (left) {
                    pilotState.vx = -horizontalSpeed * 0.3;
                    pilotState.facing = -1;
                } else if (right) {
                    pilotState.vx = horizontalSpeed * 0.3;
                    pilotState.facing = 1;
                }

                pilot.x += pilotState.vx * (delta / 1000);
                pilot.body.setVelocity(pilotState.vx, 0);
            } else {
                pilotState.climbing = false;
                pilot.body.setAllowGravity(true);
                const previousPilotY = pilot.y;

                if (left) {
                    pilotState.vx = -horizontalSpeed;
                    pilotState.facing = -1;
                } else if (right) {
                    pilotState.vx = horizontalSpeed;
                    pilotState.facing = 1;
                } else {
                    pilotState.vx *= 0.8;
                }

                const jumpPressed = (jumpKey && jumpKey.isDown) || vInput.up || gamepadState.jump;
                if (jumpPressed && pilotState.grounded && (left || right || !(fireKey.isDown || vInput.fire))) {
                    pilotState.vy = jumpForce;
                    pilotState.grounded = false;
                }

                pilotState.vy += gravity * (delta / 1000);
                pilotState.vy = Math.min(pilotState.vy, 900);

                pilot.x += pilotState.vx * (delta / 1000);
                pilot.y += pilotState.vy * (delta / 1000);
                pilot.body.setVelocity(pilotState.vx, pilotState.vy);

                if (pilot.y < minY) pilot.y = minY;
                pilotState.grounded = Boolean((pilot.body && pilot.body.blocked && pilot.body.blocked.down) || (pilot.body && pilot.body.touching && pilot.body.touching.down));

                const supportedByPlatform = resolveInteriorPlatformSupport(scene, pilot, pilotState, previousPilotY);

                var interiorFloorY = getInteriorGroundClampY(scene, pilot);
                if (!pilotState.grounded && !supportedByPlatform && pilot.y > interiorFloorY) {
                    pilot.y = interiorFloorY;
                    pilotState.vy = 0;
                    pilot.body.setVelocityY(0);
                    pilotState.grounded = true;
                }
            }
        } else {
            if (left) {
                pilotState.vx = -horizontalSpeed;
                pilotState.facing = -1;
            } else if (right) {
                pilotState.vx = horizontalSpeed;
                pilotState.facing = 1;
            } else {
                pilotState.vx *= 0.8;
            }

            const jumpPressed = (jumpKey && jumpKey.isDown) || vInput.up || gamepadState.jump;
            if (jumpPressed && pilotState.grounded && (left || right || !(fireKey.isDown || vInput.fire))) {
                pilotState.vy = jumpForce;
                pilotState.grounded = false;
            }

            pilotState.vy += gravity * (delta / 1000);
            pilotState.vy = Math.min(pilotState.vy, 900);

            pilot.x += pilotState.vx * (delta / 1000);
            pilot.y += pilotState.vy * (delta / 1000);
            pilot.body.setVelocity(pilotState.vx, pilotState.vy);

            const terrainVariation = Math.sin(pilot.x / 200) * 30;
            const maxY = groundLevel - terrainVariation - 12;
            if (pilot.y < minY) pilot.y = minY;
            if (pilot.y > maxY) {
                pilot.y = maxY;
                pilotState.vy = 0;
                pilotState.grounded = true;
            } else {
                pilotState.grounded = false;
            }
        }

        pilot.flipX = pilotState.facing < 0;
        playerState.direction = pilotState.facing < 0 ? 'left' : 'right';
        syncActivePlayer(scene);
    }

    const activePlayer = syncActivePlayer(scene);

    if ((fireKey.isDown || vInput.fire || gamepadState.fire) && time > playerState.lastFire + playerState.fireRate) {
        let angle = null;
        if (pilotState.active) {
            angle = getPilotAimAngle(left, right, up, down, pilotState.grounded);
        } else if (aegisState.active && aegisState.mode === 'bulwark') {
            angle = aegisState.aimAngle;
        }
        fireWeapon(scene, angle);
        if (audioManager) {
            const p = playerState.powerUps;
            const usePilotSound = pilotState.active && !aegisState.active;
            const useSpreadSound = !usePilotSound && playerState.primaryWeapon === 'multiShot' && p.multiShot >= 2;
            audioManager.playSound(useSpreadSound ? 'playerFireSpread' : 'playerFire');
        }
        playerState.lastFire = time;
    }

    if (playerState.powerUps.shield > 0 && !activePlayer.shieldSprite) {
        activePlayer.shieldSprite = scene.add.sprite(activePlayer.x, activePlayer.y, 'shield');
        activePlayer.shieldSprite.setAlpha(0.7);
        activePlayer.shieldSprite.setDepth(FG_DEPTH_BASE + 11);
        activePlayer.shieldSprite.setScale(1.2);
    } else if (playerState.powerUps.shield <= 0 && activePlayer.shieldSprite) {
        const shieldSprite = activePlayer.shieldSprite;
        const shieldX = shieldSprite.x;
        const shieldY = shieldSprite.y;
        scene.tweens.add({
            targets: shieldSprite,
            scale: 2,
            alpha: 0,
            duration: 300,
            ease: 'Power2.easeOut',
            onComplete: () => {
                if (shieldSprite && shieldSprite.destroy) shieldSprite.destroy();
                if (activePlayer.shieldSprite === shieldSprite) activePlayer.shieldSprite = null;
            }
        });
        createExplosion(scene, shieldX, shieldY, 0x00aaff);
    }

    if (activePlayer.shieldSprite) {
        activePlayer.shieldSprite.x = activePlayer.x;
        activePlayer.shieldSprite.y = activePlayer.y;
        const pulse = Math.sin(Date.now() * 0.008) * 0.15 + 0.7;
        activePlayer.shieldSprite.setAlpha(pulse);
        const colorShift = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
        activePlayer.shieldSprite.setTint(Phaser.Display.Color.GetColor(
            Math.floor(255 * colorShift),
            255,
            Math.floor(255 * colorShift)
        ));
    }

    const velocityX = activePlayer.body.velocity.x;
    const velocityY = activePlayer.body.velocity.y;
    const movementSpeed = Math.hypot(velocityX, velocityY);
    if (particleManager && movementSpeed > 20 && aegisState.active) {
        const rotation = movementSpeed > 0
            ? Math.atan2(velocityY, velocityX)
            : (playerState.direction === 'right' ? 0 : Math.PI);
        const exhaustInterval = 40;
        if (!playerState.lastExhaustTime || time - playerState.lastExhaustTime >= exhaustInterval) {
            particleManager.makeExhaustFire(activePlayer.x, activePlayer.y, rotation);
            playerState.lastExhaustTime = time;
        }
        particleManager.makeExhaustTrail(activePlayer.x, activePlayer.y, rotation, movementSpeed);
    } else if (particleManager) {
        particleManager.stopExhaustTrail();
    }
}


// Reads keyboard-compatible movement and action values from the first connected gamepad.
function getGamepadInputState(scene) {
    const neutralState = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false,
        jump: false,
        transformPressed: false,
        bombPressed: false,
        hyperspacePressed: false,
        pausePressed: false,
        switchPrimaryPressed: false,
        ejectPressed: false,
        enterPressed: false,
    };

    const padManager = scene && scene.input ? scene.input.gamepad : null;
    const pad = padManager && Array.isArray(padManager.gamepads)
        ? padManager.gamepads.find((g) => g && g.connected)
        : null;
    if (!pad) return neutralState;

    const axisThreshold = 0.35;
    const leftAxisX = getGamepadAxisValue(pad, 0);
    const leftAxisY = getGamepadAxisValue(pad, 1);

    const leftDpad = getGamepadButtonDown(pad, 14);
    const rightDpad = getGamepadButtonDown(pad, 15);
    const upDpad = getGamepadButtonDown(pad, 12);
    const downDpad = getGamepadButtonDown(pad, 13);

    const fireHeld = getGamepadButtonDown(pad, 7) || getGamepadButtonDown(pad, 5) || getGamepadButtonDown(pad, 0);
    const jumpHeld = getGamepadButtonDown(pad, 0);

    return {
        left: leftDpad || leftAxisX <= -axisThreshold,
        right: rightDpad || leftAxisX >= axisThreshold,
        up: upDpad || leftAxisY <= -axisThreshold,
        down: downDpad || leftAxisY >= axisThreshold,
        fire: fireHeld,
        jump: jumpHeld,
        transformPressed: getGamepadButtonEdge(pad, 3),
        bombPressed: getGamepadButtonEdge(pad, 1),
        hyperspacePressed: getGamepadButtonEdge(pad, 8),
        pausePressed: getGamepadButtonEdge(pad, 9),
        switchPrimaryPressed: getGamepadButtonEdge(pad, 4),
        ejectPressed: getGamepadButtonEdge(pad, 2),
        enterPressed: getGamepadButtonEdge(pad, 2),
    };
}

// Returns true when either keyboard JustDown or gamepad press edge is detected.
function isKeyOrGamepadJustPressed(key, gamepadPressed) {
    const keyboardPressed = Boolean(key && Phaser.Input.Keyboard.JustDown(key));
    return keyboardPressed || Boolean(gamepadPressed);
}

// Safely reads a gamepad axis value by index.
function getGamepadAxisValue(pad, axisIndex) {
    if (!pad || !Array.isArray(pad.axes)) return 0;
    const axis = pad.axes[axisIndex];
    return axis && typeof axis.getValue === 'function' ? axis.getValue() : 0;
}

// Safely reads whether a gamepad button is currently held down.
function getGamepadButtonDown(pad, buttonIndex) {
    if (!pad || !Array.isArray(pad.buttons)) return false;
    const button = pad.buttons[buttonIndex];
    return Boolean(button && button.pressed);
}

// Safely reads whether a gamepad button transitioned from up to down this frame.
function getGamepadButtonEdge(pad, buttonIndex) {
    if (!pad) return false;
    const padId = typeof pad.index === 'number' ? pad.index : 0;
    if (!window.gamepadButtonState) window.gamepadButtonState = {};
    if (!window.gamepadButtonState[padId]) window.gamepadButtonState[padId] = {};

    const store = window.gamepadButtonState[padId];
    const isDown = getGamepadButtonDown(pad, buttonIndex);
    const wasDown = Boolean(store[buttonIndex]);
    store[buttonIndex] = isDown;
    return isDown && !wasDown;
}

// Returns pilot center-Y clamp so feet land on top of interior ground platform.
function getInteriorGroundClampY(scene, pilot) {
    const groundCenterY = (scene && scene.groundLevel) || CONFIG.worldHeight - 80;
    const groundTopY = groundCenterY - 10;
    const halfHeight = (pilot && pilot.body && typeof pilot.body.halfHeight === 'number')
        ? pilot.body.halfHeight
        : ((pilot && pilot.body && typeof pilot.body.height === 'number') ? pilot.body.height * 0.5 : 9);
    return groundTopY - halfHeight;
}

// Snap-resolves pilot support on top of interior one-way platforms while preserving jump-through-from-below behavior.
function resolveInteriorPlatformSupport(scene, pilot, pilotState, previousPilotY) {
    if (!scene || !pilot || !pilotState) return false;
    if (pilotState.vy < 0) return false;

    const halfHeight = (pilot && pilot.body && typeof pilot.body.halfHeight === 'number')
        ? pilot.body.halfHeight
        : ((pilot && pilot.body && typeof pilot.body.height === 'number') ? pilot.body.height * 0.5 : 9);
    const currentBottomY = pilot.y + halfHeight;
    const priorCenterY = typeof previousPilotY === 'number' ? previousPilotY : pilot.y;
    const previousBottomY = priorCenterY + halfHeight;
    const platforms = (scene.platforms && scene.platforms.children && Array.isArray(scene.platforms.children.entries))
        ? scene.platforms.children.entries
        : [];

    let bestTopY = Number.POSITIVE_INFINITY;
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        if (!platform || !platform.active || platform.platformType !== 'platform') continue;

        const platformWidth = (platform.body && typeof platform.body.width === 'number')
            ? platform.body.width
            : (platform.width || 0);
        const platformHeight = (platform.body && typeof platform.body.height === 'number')
            ? platform.body.height
            : (platform.height || 0);
        const halfWidth = platformWidth * 0.5;
        const topY = platform.y - platformHeight * 0.5;

        const inHorizontalBounds = pilot.x >= platform.x - halfWidth && pilot.x <= platform.x + halfWidth;
        if (!inHorizontalBounds) continue;

        const approachedFromAbove = previousBottomY <= topY + 8;
        const crossedTopSurface = currentBottomY >= topY - 1;
        if (!approachedFromAbove || !crossedTopSurface) continue;

        if (topY < bestTopY) bestTopY = topY;
    }

    if (!Number.isFinite(bestTopY)) return false;

    pilot.y = bestTopY - halfHeight;
    pilotState.vy = 0;
    if (pilot.body && typeof pilot.body.setVelocityY === 'function') {
        pilot.body.setVelocityY(0);
    }
    pilotState.grounded = true;
    return true;
}

// Computes pilot aim direction from movement inputs and grounded state.
function getPilotAimAngle(left, right, up, down, grounded) {
    let aimX = 0;
    let aimY = 0;

    if (left) aimX = -1;
    if (right) aimX = 1;

    if (up) aimY = -1;
    if (down && !grounded) aimY = 1;

    if (aimX === 0 && aimY === 0) {
        aimX = pilotState.facing;
    }

    return Math.atan2(aimY, aimX);
}

// Computes bulwark firing angle from directional inputs with fallback to facing direction.
function getBulwarkAimAngle(left, right, up, down) {
    const aimX = (left ? -1 : 0) + (right ? 1 : 0);
    const aimY = (up ? -1 : 0) + (down ? 1 : 0);
    if (aimX === 0 && aimY === 0) {
        return aegisState.facing < 0 ? Math.PI : 0;
    }
    return Math.atan2(aimY, aimX);
}
