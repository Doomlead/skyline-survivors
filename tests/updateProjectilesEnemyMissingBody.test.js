const test = require('node:test');
const assert = require('node:assert');

const { updateProjectiles } = require('../js/entities/player/playerWeapons');

test('updateProjectiles skips enemy projectiles without Arcade body data', () => {
    global.wrapWorldBounds = () => {};
    global.playerState = { powerUps: { timeSlow: 1 } };
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

    const scene = {
        player: { active: true },
        groundLevel: 9999,
        time: { now: 0, delayedCall: () => {} },
        tweens: { add: () => {} },
        projectiles: { children: { entries: [] } },
        enemyProjectiles: {
            children: {
                entries: [
                    {
                        active: true,
                        x: 10,
                        y: 0,
                        projectileType: 'normal',
                        setVelocity: () => {
                            throw new Error('should not attempt to set velocity without body');
                        }
                    }
                ]
            }
        },
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
