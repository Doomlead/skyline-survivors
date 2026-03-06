const test = require('node:test');
const assert = require('node:assert');

const siegeRules = require('../js/entities/assault/assaultSiegeRules');

test('bulwark siege bonus applies only to approved structural targets', () => {
    const structural = siegeRules.resolveSiegeDamage({
        baseDamage: 10,
        targetRole: 'core',
        firedAegisMode: 'bulwark'
    });
    const nonStructural = siegeRules.resolveSiegeDamage({
        baseDamage: 10,
        targetRole: 'mutant',
        firedAegisMode: 'bulwark'
    });

    assert.strictEqual(structural.bonusApplied, true);
    assert.ok(structural.damage > 10);
    assert.strictEqual(nonStructural.bonusApplied, false);
    assert.strictEqual(nonStructural.damage, 10);
});

test('interceptor shots do not receive siege multiplier even against structures', () => {
    const result = siegeRules.resolveSiegeDamage({
        baseDamage: 8,
        targetRole: 'shield',
        firedAegisMode: 'interceptor'
    });

    assert.strictEqual(result.bonusApplied, false);
    assert.strictEqual(result.multiplier, 1);
    assert.strictEqual(result.damage, 8);
});

test('siege multipliers remain in intended ttk band for structures', () => {
    const roles = ['shield', 'turret', 'core', 'power_conduit', 'security_node', 'interior_core'];
    roles.forEach((role) => {
        const result = siegeRules.resolveSiegeDamage({
            baseDamage: 10,
            targetRole: role,
            firedAegisMode: 'bulwark'
        });
        assert.ok(result.multiplier >= 1.3 && result.multiplier <= 1.75);
    });
});
