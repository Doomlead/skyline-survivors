// ------------------------
// file: js/entities/player/buildInteriorPlatforms.js
// ------------------------

// Builds procedural interior encounter platforms and ladder trigger zones.
function buildInteriorPlatforms(scene, seed) {
    if (!scene || !scene.physics) return null;

    if (scene.platforms) {
        scene.platforms.clear(true, true);
    }
    if (scene.ladders) {
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

    const platformConfig = [
        { minX: 0.1, maxX: 0.3, baseY: groundY - 100, count: 2 },
        { minX: 0.4, maxX: 0.6, baseY: groundY - 100, count: 2 },
        { minX: 0.7, maxX: 0.9, baseY: groundY - 100, count: 2 },
        { minX: 0.15, maxX: 0.35, baseY: groundY - 200, count: 1 },
        { minX: 0.5, maxX: 0.7, baseY: groundY - 200, count: 1 },
        { minX: 0.2, maxX: 0.4, baseY: groundY - 300, count: 1 },
        { minX: 0.6, maxX: 0.8, baseY: groundY - 300, count: 1 }
    ];

    const generatedPlatforms = [];

    platformConfig.forEach(function(tier) {
        for (let i = 0; i < tier.count; i++) {
            const px = (tier.minX + rng() * (tier.maxX - tier.minX)) * worldWidth;
            const pw = 80 + rng() * 120;
            const py = tier.baseY + (rng() * 40 - 20);

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
        if (platform.y > groundY - 150 && rng() > 0.3) {
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

        if (horizontalDist < 150 && verticalDist > 60 && verticalDist < 250 && rng() > 0.4) {
            scene.ladders.add(createInteriorLadder(scene, {
                x: (upper.x + lower.x) * 0.5,
                topY: upper.y,
                bottomY: lower.y - 10,
                width: 16
            }));
        }
    }

    for (let i = 0; i < 3; i++) {
        const lx = (0.2 + rng() * 0.6) * worldWidth;
        const dropLength = 100 + rng() * 150;
        scene.ladders.add(createInteriorLadder(scene, {
            x: lx,
            topY: ceilingY,
            bottomY: ceilingY + dropLength,
            width: 16,
            type: 'hanging'
        }));
    }

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
    scene.groundLevel = groundY;

    repositionInteriorObjectivesToPlatforms(scene);

    console.log('[InteriorPlatforms] Created ' + scene.platforms.getLength() + ' platforms, ' + scene.ladders.getLength() + ' ladders');

    return {
        platforms: scene.platforms,
        ladders: scene.ladders,
        anchors: platformAnchors,
        groundLevel: groundY
    };
}

// Finds closest viable platform top for interior objective placement.
function getInteriorAnchorY(scene, x, fallbackY, clearance) {
    if (!scene || !Array.isArray(scene.interiorPlatformAnchors) || scene.interiorPlatformAnchors.length === 0) {
        return fallbackY;
    }

    const desiredClearance = typeof clearance === 'number' ? clearance : 20;
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < scene.interiorPlatformAnchors.length; i++) {
        const anchor = scene.interiorPlatformAnchors[i];
        const dx = Math.abs(anchor.x - x);
        const score = dx + Math.abs((anchor.y - desiredClearance) - fallbackY) * 0.35;
        if (score < bestScore) {
            bestScore = score;
            best = anchor;
        }
    }

    if (!best) return fallbackY;
    return Math.max(80, best.y - desiredClearance);
}

function createInteriorPlatform(scene, config) {
    const x = config.x;
    const y = config.y;
    const width = config.width;
    const height = config.height;
    const type = config.type;

    const fill = type === 'ground' ? 0x3b2a52 : 0x4d3a63;
    const alpha = type === 'ground' ? 0.35 : 0.28;
    const platform = scene.add.rectangle(x, y, width, height, fill, alpha);
    scene.physics.add.existing(platform, true);

    if (type === 'platform') {
        platform.body.checkCollision.down = false;
        platform.body.checkCollision.left = false;
        platform.body.checkCollision.right = false;
    }

    platform.setStrokeStyle(1, 0x8c7aa5, 0.35);
    platform.platformType = type;
    platform.setDepth(FG_DEPTH_BASE - 1);
    return platform;
}

function createInteriorLadder(scene, config) {
    const x = config.x;
    const topY = config.topY;
    const bottomY = config.bottomY;
    const width = config.width;
    const type = config.type;

    const height = bottomY - topY;
    const centerY = topY + height * 0.5;

    const ladder = scene.add.rectangle(x, centerY, width, height, 0x46c7cf, 0.22);
    scene.physics.add.existing(ladder, true);

    ladder.body.checkCollision.up = false;
    ladder.body.checkCollision.down = false;
    ladder.body.checkCollision.left = false;
    ladder.body.checkCollision.right = false;

    ladder.ladderType = type || 'standard';
    ladder.topY = topY;
    ladder.bottomY = bottomY;
    ladder.setDepth(FG_DEPTH_BASE - 1);

    return ladder;
}

function handleInteriorLadderInteraction(player, ladder) {
    if (!player.nearbyLadder || Math.abs(ladder.y - player.y) < Math.abs(player.nearbyLadder.y - player.y)) {
        player.nearbyLadder = ladder;
    }
}

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
    buildInteriorPlatforms(scene, seed);
}
