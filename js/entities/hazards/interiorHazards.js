// ------------------------
// file: js/entities/hazards/interiorHazards.js
// ------------------------

const INTERIOR_HAZARD_HIT_COOLDOWN_MS = 550;

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
        const beam = scene.add.rectangle(lane.x, (beamTop + beamBottom) * 0.5, beamWidth, beamBottom - beamTop, 0xff3355, 0.22);
        beam.setDepth(FG_DEPTH_BASE + 2);
        beam.setBlendMode(Phaser.BlendModes.ADD);
        return beam;
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

            beams.forEach((beam) => {
                if (!beam || !beam.active) return;
                beam.setAlpha(active ? 0.28 : 0.05);
            });

            if (!active) return;

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;

            const inVerticalBand = player.y >= beamTop && player.y <= beamBottom;
            if (!inVerticalBand) return;

            const colliding = beams.some((beam) => beam && beam.active && Math.abs(player.x - beam.x) <= beamWidth * 0.6);
            if (colliding) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            beams.forEach((beam) => {
                if (beam && beam.active) beam.destroy();
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
        const door = scene.add.rectangle(anchor.x, y, doorWidth, closedHeight, 0x7c3aed, 0.26);
        door.setDepth(FG_DEPTH_BASE + 2);
        return door;
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

            doors.forEach((door) => {
                if (!door || !door.active) return;
                door.height = closed ? closedHeight : openHeight;
                door.setAlpha(closed ? 0.28 : 0.12);
            });

            if (!closed) return;

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;
            const collideDoor = doors.some((door) => door && door.active && Math.abs(player.x - door.x) <= doorWidth * 0.75 && player.y >= door.y - closedHeight * 0.55);
            if (collideDoor) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            doors.forEach((door) => {
                if (door && door.active) door.destroy();
            });
        }
    };
}

function buildSteamVentHazard(scene) {
    const lanes = Array.isArray(scene.interiorHazardLanes) ? scene.interiorHazardLanes : [];
    const groundY = scene.groundLevel || CONFIG.worldHeight - 80;
    const vents = lanes.slice(0, Math.min(3, lanes.length)).map((lane) => {
        const plume = scene.add.rectangle(lane.x, groundY - 40, 44, 20, 0x94a3b8, 0.2);
        plume.setDepth(FG_DEPTH_BASE + 2);
        return { x: lane.x, plume, active: false, timer: 0, cooldown: Phaser.Math.Between(600, 1200) };
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
                vent.plume.setAlpha(vent.active ? 0.34 : 0.12);

                if (!vent.active || !player || !player.active) return;
                const nearX = Math.abs(player.x - vent.x) <= 30;
                const inY = player.y >= groundY - vent.plume.height - 12 && player.y <= groundY + 16;
                if (nearX && inY) applyInteriorHazardHit(scene);
            });
        },
        destroy() {
            vents.forEach((vent) => {
                if (vent.plume && vent.plume.active) vent.plume.destroy();
            });
        }
    };
}

function buildRadiationZoneHazard(scene) {
    const lanes = Array.isArray(scene.interiorHazardLanes) ? scene.interiorHazardLanes : [];
    const centerLane = lanes[Math.floor(lanes.length * 0.5)] || { x: CONFIG.worldWidth * 0.5, y: CONFIG.worldHeight * 0.5 };
    const radius = 120;
    const zone = scene.add.circle(centerLane.x, (scene.groundLevel || CONFIG.worldHeight - 80) - 60, radius, 0x22c55e, 0.14);
    zone.setDepth(FG_DEPTH_BASE + 1);

    let pulse = 0;

    return {
        id: 'radiation_zone',
        update(delta) {
            pulse += delta * 0.005;
            zone.setAlpha(0.12 + (Math.sin(pulse) + 1) * 0.08);

            const player = getActivePlayer(scene);
            if (!player || !player.active) return;
            const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
            if (dist <= radius) {
                applyInteriorHazardHit(scene);
            }
        },
        destroy() {
            if (zone && zone.active) zone.destroy();
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
