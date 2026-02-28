// ------------------------
// file: js/entities/player/buildInteriorPlatforms.js
// ------------------------

// Builds procedural interior encounter platforms and ladder trigger zones.
function buildInteriorPlatforms(scene, seed, sectionTemplate) {
    if (!scene || !scene.physics) return null;

    if (typeof ensurePlatformLadderGraphics === 'function') ensurePlatformLadderGraphics(scene);

    if (scene.platforms && scene.platforms.children) {
        (scene.platforms.children.entries || []).forEach(function(platform) {
            if (!platform) return;
            if (platform.visual) platform.visual.destroy();
            if (Array.isArray(platform.visuals)) {
                platform.visuals.forEach(function(part) { if (part) part.destroy(); });
            }
        });
        scene.platforms.clear(true, true);
    }
    if (scene.ladders && scene.ladders.children) {
        (scene.ladders.children.entries || []).forEach(function(ladder) { if (ladder && ladder.visual) ladder.visual.destroy(); });
        scene.ladders.clear(true, true);
    }

    scene.platforms = scene.physics.add.staticGroup();
    scene.ladders = scene.physics.add.staticGroup();

    const worldWidth = CONFIG.worldWidth;
    const camHeight = scene.cameras && scene.cameras.main ? scene.cameras.main.height : CONFIG.height;
    const worldHeight = camHeight || CONFIG.worldHeight || CONFIG.height;
    const groundY = worldHeight - 100;
    const ceilingY = 80;

    const rng = createInteriorRNG(seed || 1337);
    const resolvedTemplate = resolveInteriorSectionTemplate(sectionTemplate);
    const traversalDirection = resolveInteriorTraversalDirection(sectionTemplate);
    const templateConfig = getInteriorTemplateConfig(resolvedTemplate, groundY, worldWidth, rng);
    const platformAnchors = [];

    const groundPlatform = createInteriorPlatform(scene, {
        x: worldWidth * 0.5,
        y: groundY,
        width: worldWidth,
        height: 20,
        type: 'ground'
    });
    scene.platforms.add(groundPlatform);
    platformAnchors.push({ x: worldWidth * 0.5, y: groundY, width: worldWidth, height: 20, type: 'ground' });

    const generatedPlatforms = [];

    templateConfig.platformConfig.forEach(function(tier) {
        const tierMin = applyInteriorTraversalToRatio(tier.minX, traversalDirection);
        const tierMax = applyInteriorTraversalToRatio(tier.maxX, traversalDirection);
        const minRatio = Math.min(tierMin, tierMax);
        const maxRatio = Math.max(tierMin, tierMax);

        for (let i = 0; i < tier.count; i++) {
            const px = (minRatio + rng() * (maxRatio - minRatio)) * worldWidth;
            const widthVariance = typeof tier.widthVariance === 'number' ? tier.widthVariance : 120;
            const baseWidth = typeof tier.baseWidth === 'number' ? tier.baseWidth : 80;
            const pw = baseWidth + rng() * widthVariance;
            const jitter = typeof tier.jitterY === 'number' ? tier.jitterY : 20;
            const py = tier.baseY + (rng() * (jitter * 2) - jitter);

            const platform = createInteriorPlatform(scene, {
                x: px,
                y: py,
                width: pw,
                height: 12,
                type: 'platform'
            });

            scene.platforms.add(platform);
            const record = { x: px, y: py, width: pw, height: 12, type: 'platform' };
            generatedPlatforms.push(record);
            platformAnchors.push(record);
        }
    });

    const sortedPlatforms = generatedPlatforms.slice().sort(function(a, b) { return b.y - a.y; });

    generatedPlatforms.forEach(function(platform) {
        if (platform.y > groundY - templateConfig.groundLadderThreshold && rng() > templateConfig.groundLadderChanceFloor) {
            scene.ladders.add(createInteriorLadder(scene, {
                x: platform.x,
                topY: platform.y,
                bottomY: groundY - 10,
                width: 16
            }));
        }
    });

    for (let i = 0; i < sortedPlatforms.length - 1; i++) {
        const upper = sortedPlatforms[i];
        const lower = sortedPlatforms[i + 1];
        const horizontalDist = Math.abs(upper.x - lower.x);
        const verticalDist = Math.abs(upper.y - lower.y);

        if (horizontalDist < templateConfig.connectorHorizontalMax
            && verticalDist > templateConfig.connectorVerticalMin
            && verticalDist < templateConfig.connectorVerticalMax
            && rng() > templateConfig.connectorChanceFloor) {
            scene.ladders.add(createInteriorLadder(scene, {
                x: (upper.x + lower.x) * 0.5,
                topY: upper.y,
                bottomY: lower.y - 10,
                width: 16
            }));
        }
    }

    for (let i = 0; i < templateConfig.hangingLadders; i++) {
        const lxRatio = applyInteriorTraversalToRatio(0.12 + rng() * 0.76, traversalDirection);
        const lx = lxRatio * worldWidth;
        const dropLength = templateConfig.hangingDropMin + rng() * (templateConfig.hangingDropMax - templateConfig.hangingDropMin);
        scene.ladders.add(createInteriorLadder(scene, {
            x: lx,
            topY: ceilingY,
            bottomY: ceilingY + dropLength,
            width: 16,
            type: 'hanging'
        }));
    }

    scene.interiorGateAnchors = (templateConfig.gateAnchors || []).map(function(anchorXRatio, idx) {
        return {
            id: resolvedTemplate + '_gate_' + idx,
            x: applyInteriorTraversalToRatio(anchorXRatio, traversalDirection) * worldWidth,
            y: groundY - 24,
            type: 'gate_anchor'
        };
    }).sort(function(a, b) {
        return traversalDirection === 'rtl' ? b.x - a.x : a.x - b.x;
    });
    scene.interiorHazardLanes = (templateConfig.hazardLanes || []).map(function(laneXRatio, idx) {
        return {
            id: resolvedTemplate + '_hazard_lane_' + idx,
            x: applyInteriorTraversalToRatio(laneXRatio, traversalDirection) * worldWidth,
            yTop: ceilingY,
            yBottom: groundY,
            type: 'hazard_lane'
        };
    });

    if (scene.pilot && scene.pilot.body) {
        if (scene.pilotPlatformCollider) scene.pilotPlatformCollider.destroy();
        if (scene.pilotLadderOverlap) scene.pilotLadderOverlap.destroy();
        scene.pilotPlatformCollider = scene.physics.add.collider(scene.pilot, scene.platforms);
        scene.pilotLadderOverlap = scene.physics.add.overlap(scene.pilot, scene.ladders, handleInteriorLadderInteraction, null, scene);
    }

    if (scene.aegis && scene.aegis.body) {
        if (scene.aegisPlatformCollider) scene.aegisPlatformCollider.destroy();
        scene.aegisPlatformCollider = scene.physics.add.collider(scene.aegis, scene.platforms);
    }

    scene.interiorPlatformsActive = true;
    scene.interiorPlatformSeed = seed || 1337;
    scene.interiorPlatformAnchors = platformAnchors;
    scene.interiorSectionTemplate = resolvedTemplate;
    scene.interiorTraversalDirection = traversalDirection;
    scene.groundLevel = groundY;

    repositionInteriorObjectivesToPlatforms(scene);

    console.log('[InteriorPlatforms] Created ' + scene.platforms.getLength() + ' platforms, ' + scene.ladders.getLength() + ' ladders for template ' + resolvedTemplate);

    return {
        platforms: scene.platforms,
        ladders: scene.ladders,
        anchors: platformAnchors,
        groundLevel: groundY,
        sectionTemplate: resolvedTemplate,
        traversalDirection: traversalDirection,
        gateAnchors: scene.interiorGateAnchors,
        hazardLanes: scene.interiorHazardLanes
    };
}

function resolveInteriorSectionTemplate(sectionTemplate) {
    if (!sectionTemplate) return 'generic';
    if (typeof sectionTemplate === 'string') return sectionTemplate;
    if (typeof sectionTemplate.id === 'string' && sectionTemplate.id) return sectionTemplate.id;
    return 'generic';
}


function resolveInteriorTraversalDirection(sectionTemplate) {
    const rawDirection = typeof sectionTemplate === 'object' && sectionTemplate
        ? sectionTemplate.traversalDirection
        : null;
    return rawDirection === 'rtl' ? 'rtl' : 'ltr';
}

function applyInteriorTraversalToRatio(ratio, traversalDirection) {
    const clamped = Phaser.Math.Clamp(typeof ratio === 'number' ? ratio : 0.5, 0, 1);
    return traversalDirection === 'rtl' ? 1 - clamped : clamped;
}

function getInteriorTemplateConfig(templateId, groundY, worldWidth, rng) {
    const defaults = {
        platformConfig: [
            { minX: 0.1, maxX: 0.3, baseY: groundY - 100, count: 2 },
            { minX: 0.4, maxX: 0.6, baseY: groundY - 100, count: 2 },
            { minX: 0.7, maxX: 0.9, baseY: groundY - 100, count: 2 },
            { minX: 0.15, maxX: 0.35, baseY: groundY - 200, count: 1 },
            { minX: 0.5, maxX: 0.7, baseY: groundY - 200, count: 1 },
            { minX: 0.2, maxX: 0.4, baseY: groundY - 300, count: 1 },
            { minX: 0.6, maxX: 0.8, baseY: groundY - 300, count: 1 }
        ],
        hangingLadders: 3,
        hangingDropMin: 100,
        hangingDropMax: 250,
        groundLadderThreshold: 150,
        groundLadderChanceFloor: 0.3,
        connectorHorizontalMax: 150,
        connectorVerticalMin: 60,
        connectorVerticalMax: 250,
        connectorChanceFloor: 0.4,
        gateAnchors: [0.33, 0.66],
        hazardLanes: [0.25, 0.5, 0.75]
    };

    const templates = {
        security_hub: {
            platformConfig: [
                { minX: 0.1, maxX: 0.26, baseY: groundY - 80, count: 2, baseWidth: 120, widthVariance: 80, jitterY: 10 },
                { minX: 0.32, maxX: 0.48, baseY: groundY - 130, count: 2, baseWidth: 100, widthVariance: 70, jitterY: 12 },
                { minX: 0.52, maxX: 0.68, baseY: groundY - 120, count: 2, baseWidth: 110, widthVariance: 70, jitterY: 12 },
                { minX: 0.74, maxX: 0.9, baseY: groundY - 85, count: 2, baseWidth: 120, widthVariance: 80, jitterY: 10 }
            ],
            hangingLadders: 1,
            gateAnchors: [0.25, 0.5, 0.75],
            hazardLanes: [0.3, 0.7]
        },
        power_generation: {
            platformConfig: [
                { minX: 0.1, maxX: 0.3, baseY: groundY - 90, count: 2, baseWidth: 100, widthVariance: 110, jitterY: 18 },
                { minX: 0.35, maxX: 0.55, baseY: groundY - 220, count: 2, baseWidth: 110, widthVariance: 120, jitterY: 28 },
                { minX: 0.6, maxX: 0.9, baseY: groundY - 330, count: 2, baseWidth: 120, widthVariance: 120, jitterY: 32 },
                { minX: 0.2, maxX: 0.42, baseY: groundY - 410, count: 1, baseWidth: 130, widthVariance: 90, jitterY: 26 }
            ],
            hangingLadders: 4,
            hangingDropMin: 140,
            hangingDropMax: 300,
            connectorHorizontalMax: 210,
            connectorVerticalMax: 320,
            gateAnchors: [0.4, 0.82],
            hazardLanes: [0.2, 0.45, 0.68, 0.86]
        },
        reactor_core: {
            platformConfig: [
                { minX: 0.18, maxX: 0.35, baseY: groundY - 180, count: 1, baseWidth: 180, widthVariance: 80, jitterY: 10 },
                { minX: 0.4, maxX: 0.6, baseY: groundY - 280, count: 2, baseWidth: 170, widthVariance: 110, jitterY: 12 },
                { minX: 0.65, maxX: 0.82, baseY: groundY - 180, count: 1, baseWidth: 180, widthVariance: 80, jitterY: 10 }
            ],
            hangingLadders: 2,
            connectorHorizontalMax: 240,
            gateAnchors: [0.5],
            hazardLanes: [0.4, 0.6]
        },
        hangar_bay: {
            platformConfig: [
                { minX: 0.1, maxX: 0.3, baseY: groundY - 90, count: 2, baseWidth: 120, widthVariance: 100, jitterY: 14 },
                { minX: 0.38, maxX: 0.62, baseY: groundY - 170, count: 2, baseWidth: 120, widthVariance: 100, jitterY: 16 },
                { minX: 0.7, maxX: 0.9, baseY: groundY - 100, count: 2, baseWidth: 120, widthVariance: 100, jitterY: 14 }
            ],
            hangingLadders: 3,
            gateAnchors: [0.3, 0.6, 0.85],
            hazardLanes: [0.2, 0.5, 0.8]
        },
        bio_labs: {
            platformConfig: [
                { minX: 0.1, maxX: 0.27, baseY: groundY - 120, count: 2, baseWidth: 95, widthVariance: 95, jitterY: 20 },
                { minX: 0.32, maxX: 0.5, baseY: groundY - 210, count: 2, baseWidth: 100, widthVariance: 100, jitterY: 22 },
                { minX: 0.56, maxX: 0.74, baseY: groundY - 280, count: 2, baseWidth: 90, widthVariance: 95, jitterY: 24 },
                { minX: 0.78, maxX: 0.92, baseY: groundY - 190, count: 1, baseWidth: 120, widthVariance: 85, jitterY: 18 }
            ],
            hangingLadders: 4,
            gateAnchors: [0.24, 0.5, 0.76],
            hazardLanes: [0.15, 0.35, 0.55, 0.75]
        },
        engine_room: {
            platformConfig: [
                { minX: 0.1, maxX: 0.28, baseY: groundY - 80, count: 2, baseWidth: 110, widthVariance: 110, jitterY: 16 },
                { minX: 0.34, maxX: 0.52, baseY: groundY - 220, count: 2, baseWidth: 100, widthVariance: 110, jitterY: 26 },
                { minX: 0.58, maxX: 0.76, baseY: groundY - 320, count: 2, baseWidth: 100, widthVariance: 120, jitterY: 30 },
                { minX: 0.78, maxX: 0.92, baseY: groundY - 180, count: 1, baseWidth: 130, widthVariance: 90, jitterY: 18 }
            ],
            hangingLadders: 3,
            hangingDropMin: 120,
            hangingDropMax: 280,
            connectorHorizontalMax: 190,
            gateAnchors: [0.42, 0.84],
            hazardLanes: [0.22, 0.44, 0.68, 0.88]
        },
        shield_control: {
            platformConfig: [
                { minX: 0.12, maxX: 0.3, baseY: groundY - 120, count: 2, baseWidth: 120, widthVariance: 90, jitterY: 14 },
                { minX: 0.38, maxX: 0.62, baseY: groundY - 220, count: 2, baseWidth: 110, widthVariance: 90, jitterY: 16 },
                { minX: 0.7, maxX: 0.88, baseY: groundY - 120, count: 2, baseWidth: 120, widthVariance: 90, jitterY: 14 }
            ],
            hangingLadders: 2,
            gateAnchors: [0.5],
            hazardLanes: [0.26, 0.5, 0.74]
        },
        central_intelligence_core: {
            platformConfig: [
                { minX: 0.15, maxX: 0.35, baseY: groundY - 160, count: 1, baseWidth: 200, widthVariance: 80, jitterY: 10 },
                { minX: 0.38, maxX: 0.62, baseY: groundY - 300, count: 2, baseWidth: 180, widthVariance: 90, jitterY: 12 },
                { minX: 0.65, maxX: 0.85, baseY: groundY - 160, count: 1, baseWidth: 200, widthVariance: 80, jitterY: 10 }
            ],
            hangingLadders: 2,
            connectorHorizontalMax: 250,
            gateAnchors: [0.5],
            hazardLanes: [0.33, 0.5, 0.67]
        }
    };

    const base = Object.assign({}, defaults, templates[templateId] || {});
    if (!templates[templateId] && templateId && templateId !== 'generic') {
        const variant = rng();
        if (variant > 0.66) {
            base.hangingLadders = Math.max(2, base.hangingLadders - 1);
        } else if (variant < 0.33) {
            base.hangingLadders = base.hangingLadders + 1;
        }
    }
    return base;
}


// Finds closest viable platform top for interior objective placement.

function resolveInteriorSceneTraversalDirection(scene) {
    if (!scene) return 'ltr';
    return scene.interiorTraversalDirection === 'rtl' ? 'rtl' : 'ltr';
}

function toInteriorDirectionalX(scene, x) {
    const worldWidth = CONFIG.worldWidth || 0;
    const normalizedX = Phaser.Math.Clamp(
        typeof x === 'number' ? x : worldWidth * 0.5,
        0,
        worldWidth
    );
    return resolveInteriorSceneTraversalDirection(scene) === 'rtl'
        ? worldWidth - normalizedX
        : normalizedX;
}

function getInteriorAnchorY(scene, x, fallbackY, clearance) {
    if (!scene || !Array.isArray(scene.interiorPlatformAnchors) || scene.interiorPlatformAnchors.length === 0) {
        return fallbackY;
    }

    const desiredClearance = typeof clearance === 'number' ? clearance : 20;
    const worldWidth = scene.physics?.world?.bounds?.width || CONFIG.worldWidth || 0;
    const wrapDistance = (a, b) => {
        const direct = Math.abs(a - b);
        if (!worldWidth || worldWidth <= 0) return direct;
        return Math.min(direct, worldWidth - direct);
    };
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < scene.interiorPlatformAnchors.length; i++) {
        const anchor = scene.interiorPlatformAnchors[i];
        const dx = wrapDistance(anchor.x, x);
        const score = dx + Math.abs((anchor.y - desiredClearance) - fallbackY) * 0.35;
        if (score < bestScore) {
            bestScore = score;
            best = anchor;
        }
    }

    if (!best) return fallbackY;
    return Math.max(80, best.y - desiredClearance);
}

/**
 * Handles the createInteriorPlatform routine and encapsulates its core gameplay logic.
 * Parameters: scene, config.
 * Returns: value defined by the surrounding game flow.
 */
function createInteriorPlatform(scene, config) {
    const x = config.x;
    const y = config.y;
    const width = config.width;
    const height = config.height;
    const type = config.type;

    const platform = scene.add.rectangle(x, y, width, height, 0x000000, 0);
    scene.physics.add.existing(platform, true);

    if (type === 'platform') {
        platform.body.checkCollision.down = false;
        platform.body.checkCollision.left = false;
        platform.body.checkCollision.right = false;
    }

    if (scene.textures.exists('interior_platform_tile')) {
        if (type === 'ground' && width > 1024) {
            const visuals = [];
            const segmentWidth = 768;
            const count = Math.ceil(width / segmentWidth);
            for (let i = 0; i < count; i++) {
                const partWidth = Math.min(segmentWidth, width - i * segmentWidth);
                const partX = (x - width * 0.5) + (i * segmentWidth) + partWidth * 0.5;
                const partVisual = scene.add.tileSprite(partX, y, Math.max(8, partWidth), Math.max(6, height), 'interior_platform_tile');
                partVisual.setDepth(FG_DEPTH_BASE + 1);
                visuals.push(partVisual);
            }
            platform.visuals = visuals;
        } else {
            var visual = scene.add.tileSprite(x, y, Math.max(8, width), Math.max(6, height), 'interior_platform_tile');
            visual.setDepth(FG_DEPTH_BASE + 1);
            platform.visual = visual;
        }
    } else {
        platform.fillColor = 0x4d3a63;
        platform.fillAlpha = 0.28;
        platform.setStrokeStyle(1, 0x8c7aa5, 0.35);
    }

    platform.platformType = type;
    platform.setDepth(FG_DEPTH_BASE - 1);
    return platform;
}

/**
 * Handles the createInteriorLadder routine and encapsulates its core gameplay logic.
 * Parameters: scene, config.
 * Returns: value defined by the surrounding game flow.
 */
function createInteriorLadder(scene, config) {
    const x = config.x;
    const topY = config.topY;
    const bottomY = config.bottomY;
    const width = config.width;
    const type = config.type;

    const height = bottomY - topY;
    const centerY = topY + height * 0.5;

    const ladder = scene.add.rectangle(x, centerY, width, height, 0x000000, 0);
    scene.physics.add.existing(ladder, true);

    ladder.body.checkCollision.up = false;
    ladder.body.checkCollision.down = false;
    ladder.body.checkCollision.left = false;
    ladder.body.checkCollision.right = false;

    if (scene.textures.exists('interior_ladder_tile')) {
        var ladderVisual = scene.add.tileSprite(x, centerY, Math.max(8, width), Math.max(8, height), 'interior_ladder_tile');
        ladderVisual.setDepth(FG_DEPTH_BASE - 1);
        ladder.visual = ladderVisual;
    } else {
        ladder.fillColor = 0x46c7cf;
        ladder.fillAlpha = 0.22;
    }

    ladder.ladderType = type || 'standard';
    ladder.topY = topY;
    ladder.bottomY = bottomY;
    ladder.setDepth(FG_DEPTH_BASE - 1);

    return ladder;
}

/**
 * Handles the handleInteriorLadderInteraction routine and encapsulates its core gameplay logic.
 * Parameters: player, ladder.
 * Returns: value defined by the surrounding game flow.
 */
function handleInteriorLadderInteraction(player, ladder) {
    if (!player.nearbyLadder || Math.abs(ladder.y - player.y) < Math.abs(player.nearbyLadder.y - player.y)) {
        player.nearbyLadder = ladder;
    }
}

/**
 * Handles the createInteriorRNG routine and encapsulates its core gameplay logic.
 * Parameters: seed.
 * Returns: value defined by the surrounding game flow.
 */
function createInteriorRNG(seed) {
    let state = seed >>> 0;
    return function() {
        state += 0x6d2b79f5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


// Returns ladder candidate for current pilot position without relying on callback ordering.
function findInteriorNearbyLadder(scene, pilot) {
    if (!scene || !scene.ladders || !scene.ladders.children || !pilot) return null;
    const ladders = scene.ladders.children.entries || [];
    let best = null;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < ladders.length; i++) {
        const ladder = ladders[i];
        if (!ladder || !ladder.active) continue;
        const halfW = (ladder.width || 0) * 0.5;
        const halfH = (ladder.height || 0) * 0.5;
        const inX = Math.abs(pilot.x - ladder.x) <= Math.max(halfW + 14, 20);
        const inY = pilot.y >= ladder.y - halfH - 10 && pilot.y <= ladder.y + halfH + 10;
        if (!inX || !inY) continue;
        const d = Math.abs(pilot.x - ladder.x) + Math.abs(pilot.y - ladder.y) * 0.25;
        if (d < bestDist) {
            bestDist = d;
            best = ladder;
        }
    }
    return best;
}

// Keeps interior objectives visually/physically aligned to platform anchors after rebuild/resize.
function repositionInteriorObjectivesToPlatforms(scene) {
    if (!scene || !scene.assaultTargets || !scene.assaultTargets.children) return;
    const entries = scene.assaultTargets.children.entries || [];
    for (let i = 0; i < entries.length; i++) {
        const target = entries[i];
        if (!target || !target.active || !target.interiorTarget) continue;
        let clearance = 24;
        switch (target.assaultRole) {
            case 'power_conduit': clearance = 20; break;
            case 'security_node': clearance = 40; break;
            case 'interior_core': clearance = 30; break;
            default: break;
        }
        const fallbackY = target.y;
        target.y = getInteriorAnchorY(scene, target.x, fallbackY, clearance);
        if (target.body) target.body.setVelocity(0, 0);
    }
}

// Rebuilds interior platforms after viewport/height changes to prevent off-screen colliders.
function rebuildInteriorPlatformsOnResize(scene) {
    if (!scene || !scene.interiorPlatformsActive) return;
    const seed = scene.interiorPlatformSeed || CONFIG.backgroundSeed || 1337;
    buildInteriorPlatforms(scene, seed, scene.interiorSectionTemplate || (scene.currentInteriorSection && scene.currentInteriorSection.id));
}
