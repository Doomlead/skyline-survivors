const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles ignores null projectile entries in player and enemy groups', () => {
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

    const playerProjectile = {
        active: true,
        x: 0,
        y: 0,
        projectileType: 'normal',
        body: { velocity: { x: 300, y: 0 } },
        setVelocity: () => {},
        destroy: () => {}
    };

    const enemyProjectile = {
        active: true,
        x: 10,
        y: 0,
        projectileType: 'normal',
        body: { velocity: { x: -200, y: 0 } },
        setVelocity: () => {},
        destroy: () => {}
    };

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [null, playerProjectile] } },
        enemyProjectiles: { children: { entries: [null, enemyProjectile] } },
        enemies: { children: { entries: [] } },
        garrisonDefenders: { children: { entries: [] } },
        bosses: { children: { entries: [] } },
        battleships: { children: { entries: [] } },
        assaultTargets: { children: { entries: [] } }
    };

    assert.doesNotThrow(() => updateProjectiles(scene));

    delete global.wrapWorldBounds;
    delete global.playerState;
    delete global.CONFIG;
    delete global.Phaser;
});
