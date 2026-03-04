// ------------------------
// file: js/entities/hazards/interiorHazards.js
// ------------------------

const INTERIOR_HAZARD_HIT_COOLDOWN_MS = 550;

function addHazardChevron(scene, x, y, color, depth) {
    const chevron = scene.add.graphics();
    chevron.fillStyle(color, 0.95);
    chevron.lineStyle(2, 0x000000, 0.9);
    chevron.beginPath();
    chevron.moveTo(x - 10, y - 8);
    chevron.lineTo(x + 10, y - 8);
    chevron.lineTo(x, y + 10);
    chevron.closePath();
    chevron.fillPath();
    chevron.strokePath();
    chevron.setDepth(depth);
    return chevron;
}

// Returns the currently active section descriptor for an objective.
function getInteriorHazardSection(objective) {
    if (!objective) return null;
    const index = objective.currentSectionIndex || 0;
    if (Array.isArray(objective.sectionGraph)) {
        return objective.sectionGraph[index] || null;
    }
    return null;
}

// Removes any active interior hazard controllers and their display objects.
function clearInteriorHazards(scene) {
    const hazardState = scene?.interiorHazards;
    if (!hazardState || !Array.isArray(hazardState.controllers)) {
        scene.interiorHazards = null;
        return;
    }

    hazardState.controllers.forEach((controller) => {
        if (!controller) return;
        if (typeof controller.destroy === 'function') {
            controller.destroy();
        }
    });
    scene.interiorHazards = null;
}

// Binds section-configured hazard controllers to the current interior section.
function setupInteriorHazards(scene, objective) {
    if (!scene || !objective) return;

    clearInteriorHazards(scene);

    const section = getInteriorHazardSection(objective);
    const hazardSpawners = Array.isArray(section?.hazardSpawners) ? section.hazardSpawners : [];
    if (hazardSpawners.length <= 0) return;

    const controllers = [];
    hazardSpawners.forEach((hazardKey) => {
        const factory = INTERIOR_HAZARD_FACTORIES[hazardKey];
        if (typeof factory !== 'function') return;
        const controller = factory(scene, objective, section);
        if (controller) controllers.push(controller);
    });

    scene.interiorHazards = {
        sectionId: section?.id || null,
        controllers
    };
}

// Updates all active interior hazard controllers.
function updateInteriorHazards(scene, delta, objective) {
    const hazardState = scene?.interiorHazards;
    if (!hazardState || !Array.isArray(hazardState.controllers) || !objective?.interiorPhase) return;

    const activeSectionId = getInteriorHazardSection(objective)?.id || null;
    if (hazardState.sectionId !== activeSectionId) {
        setupInteriorHazards(scene, objective);
        return;
    }

    hazardState.controllers.forEach((controller) => {
        if (controller && typeof controller.update === 'function') {
            controller.update(delta);
        }
    });
}

// Applies hazard damage to the active player with invulnerability/shield handling.
function applyInteriorHazardHit(scene) {
    if (!scene) return;
    const player = getActivePlayer(scene);
    if (!player || !player.active) return;

    const now = scene.time?.now || 0;
    if (player.interiorHazardHitUntil && now < player.interiorHazardHitUntil) return;

    player.interiorHazardHitUntil = now + INTERIOR_HAZARD_HIT_COOLDOWN_MS;

    if (playerState.powerUps.invincibility > 0) {
        return;
    }

    if (playerState.powerUps.shield > 0) {
        playerState.powerUps.shield = 0;
        screenShake(scene, 8, 140);
        if (scene.audioManager) scene.audioManager.playSound('hitPlayer');
        return;
    }

    screenShake(scene, 12, 220);
    playerDie(scene);
}

function buildLaserGridHazard(scene) {
    const lanes = Array.isArray(scene.interiorHazardLanes) ? scene.interiorHazardLanes : [];
    const selectedLanes = lanes.slice(0, Math.min(2, lanes.length));
    const beamWidth = 26;
    const beamTop = 50;
    const beamBottom = (scene.groundLevel || CONFIG.worldHeight - 80) + 10;
    const activeMs = 1600;
    const inactiveMs = 1100;

    const beams = selectedLanes.map((lane) => {
        const depth = FG_DEPTH_BASE + 2;
        const core = scene.add.rectangle(lane.x, (beamTop + beamBottom) * 0.5, beamWidth, beamBottom - beamTop, 0xff2d55, 0.58);
        const glow = scene.add.rectangle(lane.x, (beamTop + beamBottom) * 0.5, beamWidth * 2.4, beamBottom - beamTop, 0xff0055, 0.2);
        const topMarker = addHazardChevron(scene, lane.x, beamTop + 10, 0xfff173, depth + 1);
        const bottomMarker = addHazardChevron(scene, lane.x, beamBottom - 10, 0xfff173, depth + 1);
        core.setDepth(depth + 1);
        glow.setDepth(depth);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        core.setStrokeStyle(2, 0xffffff, 0.95);
        return { x: lane.x, core, glow, topMarker, bottomMarker };
    });

    let timer = 0;
    let active = true;

    return {
        id: 'laser_grid',
        update(delta) {
            timer += delta;
            const threshold = active ? activeMs : inactiveMs;
            if (timer >= threshold) {
                timer = 0;
                active = !active;
            }

            const pulse = 0.85 + Math.sin(timer * 0.015) * 0.15;
            beams.forEach((beam) => {
                if (!beam || !beam.core || !beam.core.active) return;
                beam.core.setAlpha(active ? 0.58 * pulse : 0.12);
                beam.glow.setAlpha(active ? 0.28 * pulse : 0.03);
                beam.topMarker.setAlpha(active ? 0.95 : 0.2);
                beam.bottomMarker.setAlpha(active ? 0.95 : 0.2);
            });

            if (!active) return;

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;

            const inVerticalBand = player.y >= beamTop && player.y <= beamBottom;
            if (!inVerticalBand) return;

            const colliding = beams.some((beam) => beam && beam.core && beam.core.active && Math.abs(player.x - beam.x) <= beamWidth * 0.6);
            if (colliding) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            beams.forEach((beam) => {
                if (!beam) return;
                if (beam.core && beam.core.active) beam.core.destroy();
                if (beam.glow && beam.glow.active) beam.glow.destroy();
                if (beam.topMarker && beam.topMarker.active) beam.topMarker.destroy();
                if (beam.bottomMarker && beam.bottomMarker.active) beam.bottomMarker.destroy();
            });
        }
    };
}

function buildLockedDoorHazard(scene) {
    const anchors = Array.isArray(scene.interiorGateAnchors) ? scene.interiorGateAnchors : [];
    const selected = anchors.slice(0, Math.min(2, anchors.length));
    const doorWidth = 46;
    const closedHeight = 120;
    const openHeight = 16;
    const closedMs = 1700;
    const openMs = 1300;

    const doors = selected.map((anchor) => {
        const y = (scene.groundLevel || CONFIG.worldHeight - 80) - closedHeight * 0.5;
        const frame = scene.add.rectangle(anchor.x, y, doorWidth + 16, closedHeight + 8, 0xffcc33, 0.35);
        const door = scene.add.rectangle(anchor.x, y, doorWidth, closedHeight, 0x8b5cf6, 0.8);
        const stripeA = scene.add.rectangle(anchor.x - 8, y, 6, closedHeight, 0xffffff, 0.7);
        const stripeB = scene.add.rectangle(anchor.x + 8, y, 6, closedHeight, 0xffffff, 0.7);
        frame.setDepth(FG_DEPTH_BASE + 2);
        door.setDepth(FG_DEPTH_BASE + 3);
        stripeA.setDepth(FG_DEPTH_BASE + 4);
        stripeB.setDepth(FG_DEPTH_BASE + 4);
        frame.setStrokeStyle(2, 0x000000, 0.9);
        return { x: anchor.x, y, frame, door, stripeA, stripeB };
    });

    let timer = 0;
    let closed = true;

    return {
        id: 'locked_doors',
        update(delta) {
            timer += delta;
            const threshold = closed ? closedMs : openMs;
            if (timer >= threshold) {
                timer = 0;
                closed = !closed;
            }

            const pulse = 0.85 + Math.sin(timer * 0.013) * 0.15;
            doors.forEach((door) => {
                if (!door || !door.door || !door.door.active) return;
                door.door.height = closed ? closedHeight : openHeight;
                door.frame.height = closed ? closedHeight + 8 : openHeight + 8;
                door.stripeA.height = door.door.height;
                door.stripeB.height = door.door.height;
                door.door.y = door.y;
                door.frame.y = door.y;
                door.stripeA.y = door.y;
                door.stripeB.y = door.y;
                door.door.setAlpha(closed ? 0.8 * pulse : 0.22);
                door.frame.setAlpha(closed ? 0.42 : 0.16);
                door.stripeA.setAlpha(closed ? 0.85 : 0.18);
                door.stripeB.setAlpha(closed ? 0.85 : 0.18);
            });

            if (!closed) return;

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;
            const collideDoor = doors.some((door) => door && door.door && door.door.active && Math.abs(player.x - door.x) <= doorWidth * 0.75 && player.y >= door.y - closedHeight * 0.55);
            if (collideDoor) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            doors.forEach((door) => {
                if (!door) return;
                if (door.frame && door.frame.active) door.frame.destroy();
                if (door.door && door.door.active) door.door.destroy();
                if (door.stripeA && door.stripeA.active) door.stripeA.destroy();
                if (door.stripeB && door.stripeB.active) door.stripeB.destroy();
            });
        }
    };
}

function buildSteamVentHazard(scene) {
    const lanes = Array.isArray(scene.interiorHazardLanes) ? scene.interiorHazardLanes : [];
    const groundY = scene.groundLevel || CONFIG.worldHeight - 80;
    const vents = lanes.slice(0, Math.min(3, lanes.length)).map((lane) => {
        const ventCap = scene.add.rectangle(lane.x, groundY - 8, 50, 18, 0x374151, 0.95);
        const ventCore = scene.add.rectangle(lane.x, groundY - 8, 28, 8, 0xf97316, 0.9);
        const plume = scene.add.rectangle(lane.x, groundY - 40, 54, 20, 0xcbd5e1, 0.35);
        const warning = addHazardChevron(scene, lane.x, groundY - 24, 0xfff173, FG_DEPTH_BASE + 4);
        ventCap.setDepth(FG_DEPTH_BASE + 2);
        ventCore.setDepth(FG_DEPTH_BASE + 3);
        plume.setDepth(FG_DEPTH_BASE + 2);
        ventCap.setStrokeStyle(2, 0x111827, 1);
        return { x: lane.x, plume, ventCap, ventCore, warning, active: false, timer: 0, cooldown: Phaser.Math.Between(600, 1200) };
    });

    return {
        id: 'steam_vents',
        update(delta) {
            const player = getActivePlayer(scene);
            vents.forEach((vent) => {
                vent.timer += delta;
                if (!vent.active && vent.timer >= vent.cooldown) {
                    vent.active = true;
                    vent.timer = 0;
                    vent.cooldown = Phaser.Math.Between(800, 1200);
                } else if (vent.active && vent.timer >= 700) {
                    vent.active = false;
                    vent.timer = 0;
                    vent.cooldown = Phaser.Math.Between(1000, 1800);
                }

                const targetHeight = vent.active ? 120 : 20;
                vent.plume.height = Phaser.Math.Linear(vent.plume.height, targetHeight, 0.2);
                vent.plume.y = groundY - vent.plume.height * 0.5;
                vent.plume.setAlpha(vent.active ? 0.55 : 0.18);
                vent.ventCore.setAlpha(vent.active ? 1 : 0.4);
                vent.warning.setAlpha(vent.active ? 1 : 0.45);

                if (!vent.active || !player || !player.active) return;
                const nearX = Math.abs(player.x - vent.x) <= 30;
                const inY = player.y >= groundY - vent.plume.height - 12 && player.y <= groundY + 16;
                if (nearX && inY) applyInteriorHazardHit(scene);
            });
        },
        destroy() {
            vents.forEach((vent) => {
                if (vent.plume && vent.plume.active) vent.plume.destroy();
                if (vent.ventCap && vent.ventCap.active) vent.ventCap.destroy();
                if (vent.ventCore && vent.ventCore.active) vent.ventCore.destroy();
                if (vent.warning && vent.warning.active) vent.warning.destroy();
            });
        }
    };
}

function buildRadiationZoneHazard(scene) {
    const lanes = Array.isArray(scene.interiorHazardLanes) ? scene.interiorHazardLanes : [];
    const centerLane = lanes[Math.floor(lanes.length * 0.5)] || { x: CONFIG.worldWidth * 0.5, y: CONFIG.worldHeight * 0.5 };
    const radius = 120;
    const zoneX = centerLane.x;
    const zoneY = (scene.groundLevel || CONFIG.worldHeight - 80) - 60;
    const outerZone = scene.add.circle(zoneX, zoneY, radius + 14, 0x84cc16, 0.24);
    const zone = scene.add.circle(zoneX, zoneY, radius, 0x22c55e, 0.32);
    const core = scene.add.circle(zoneX, zoneY, Math.floor(radius * 0.45), 0xa3e635, 0.4);
    const north = addHazardChevron(scene, zoneX, zoneY - radius - 8, 0xfff173, FG_DEPTH_BASE + 3);
    const south = addHazardChevron(scene, zoneX, zoneY + radius + 8, 0xfff173, FG_DEPTH_BASE + 3);
    outerZone.setDepth(FG_DEPTH_BASE + 1);
    zone.setDepth(FG_DEPTH_BASE + 2);
    core.setDepth(FG_DEPTH_BASE + 3);

    let pulse = 0;

    return {
        id: 'radiation_zone',
        update(delta) {
            pulse += delta * 0.005;
            const phase = (Math.sin(pulse) + 1) * 0.5;
            zone.setAlpha(0.24 + phase * 0.22);
            outerZone.setAlpha(0.16 + phase * 0.16);
            core.setAlpha(0.2 + phase * 0.24);
            north.setAlpha(0.6 + phase * 0.4);
            south.setAlpha(0.6 + phase * 0.4);

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
            if (dist <= radius) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            if (outerZone && outerZone.active) outerZone.destroy();
            if (zone && zone.active) zone.destroy();
            if (core && core.active) core.destroy();
            if (north && north.active) north.destroy();
            if (south && south.active) south.destroy();
        }
    };
}

// Maps section hazard identifiers to modular hazard controller factories.
const INTERIOR_HAZARD_FACTORIES = {
    laser_grid: buildLaserGridHazard,
    locked_doors: buildLockedDoorHazard,
    steam_vents: buildSteamVentHazard,
    steam_jets: buildSteamVentHazard,
    radiation_zone: buildRadiationZoneHazard,
    toxic_spores: buildRadiationZoneHazard,
    containment_breach: buildRadiationZoneHazard,
    core_energy_pulse: buildRadiationZoneHazard
};
