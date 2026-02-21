const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('tier-2 homing projectiles can retarget to bosses and battleships', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 0 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };
    global.Phaser = {
        Math: {
            Distance: {
                Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
            },
            Angle: {
                Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
            }
        }
    };

    const velocityCalls = [];
    const projectile = {
        active: true,
        x: 0,
        y: 0,
        projectileType: 'homing',
        homingTier: 2,
        body: { velocity: { x: 300, y: 0 } },
        setVelocity: (x, y) => velocityCalls.push({ x, y }),
        destroy: () => {}
    };

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [projectile] } },
        enemyProjectiles: { children: { entries: [] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [{ active: true, x: 100, y: 0 }] } },
        battleships: { children: { entries: [] } }
    };

    updateProjectiles(scene);

    assert.ok(velocityCalls.length > 0, 'expected homing projectile to retarget to boss');
    assert.strictEqual(projectile.rotation, 0);

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
    delete global.Phaser;
});

test('tier-2 homing projectiles can retarget to assault targets', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 0 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };
    global.Phaser = {
        Math: {
            Distance: {
                Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
            },
            Angle: {
                Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
            }
        }
    };

    const velocityCalls = [];
    const projectile = {
        active: true,
        x: 0,
        y: 0,
        projectileType: 'homing',
        homingTier: 2,
        body: { velocity: { x: 300, y: 0 } },
        setVelocity: (x, y) => velocityCalls.push({ x, y }),
        destroy: () => {}
    };

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [projectile] } },
        enemyProjectiles: { children: { entries: [] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [] } },
        battleships: { children: { entries: [] } },
        assaultTargets: { children: { entries: [{ active: true, x: 100, y: 0 }] } }
    };

    updateProjectiles(scene);

    assert.ok(velocityCalls.length > 0, 'expected homing projectile to retarget to assault target');
    assert.strictEqual(projectile.rotation, 0);

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
    delete global.Phaser;
});


test('tier-2 homing projectiles do not throw when target groups are partially initialized', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 0 } };
    global.CONFIG = { worldWidth: 2000, worldHeight: 1200 };
    global.Phaser = {
        Math: {
            Distance: {
                Between: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1)
            },
            Angle: {
                Between: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1)
            }
        }
    };

    const velocityCalls = [];
    const projectile = {
        active: true,
        x: 0,
        y: 0,
        projectileType: 'homing',
        homingTier: 2,
        body: { velocity: { x: 300, y: 0 } },
        setVelocity: (x, y) => velocityCalls.push({ x, y }),
        destroy: () => {}
    };

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [projectile] } },
        enemyProjectiles: { children: { entries: [] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: {},
        bosses: null,
        battleships: { children: { entries: [{ active: true, x: 100, y: 0 }] } },
        assaultTargets: { children: {} }
    };

    assert.doesNotThrow(() => updateProjectiles(scene));
    assert.ok(velocityCalls.length > 0, 'expected homing projectile to retarget despite partial group initialization');

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
    delete global.Phaser;
});
