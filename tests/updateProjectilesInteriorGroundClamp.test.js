const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles keeps pilot projectiles alive above flat interior floor', () => {
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

    let destroyed = false;
    const projectile = {
        active: true,
        x: 1000,
        y: 680,
        projectileType: 'normal',
        body: { velocity: { x: 760, y: 0 } },
        setVelocity: () => {},
        destroy: () => { destroyed = true; }
    };

    const scene = {
        player: { active: true },
        groundLevel: 700,
        interiorPlatformsActive: true,
        platforms: {},
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [projectile] } },
        enemyProjectiles: { children: { entries: [] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [] } },
        battleships: { children: { entries: [] } },
        assaultTargets: { children: { entries: [] } }
    };

    updateProjectiles(scene);

    assert.strictEqual(destroyed, false, 'projectile should not be destroyed while above interior floor line');

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
    delete global.Phaser;
});
