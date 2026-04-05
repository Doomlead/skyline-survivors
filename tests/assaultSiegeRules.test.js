const test = require('node:test');
const assert = require('node:assert');

const {
    computeBulwarkSiegeDamage,
    isStructuralAssaultRole
} = require('../js/config/assaultSiegeRules');

test('siege bonus applies only to approved structural targets', () => {
    assert.strictEqual(isStructuralAssaultRole('shield'), true);
    assert.strictEqual(isStructuralAssaultRole('stasis_array'), true);
    assert.strictEqual(isStructuralAssaultRole('mutant'), false);

    const structural = computeBulwarkSiegeDamage(2, 'shield', { sourceMode: 'bulwark' }, { active: true, mode: 'bulwark' });
    assert.ok(structural.applied);
    assert.ok(structural.damage > 2);

    const nonStructural = computeBulwarkSiegeDamage(2, 'mutant', { sourceMode: 'bulwark' }, { active: true, mode: 'bulwark' });
    assert.strictEqual(nonStructural.applied, false);
    assert.strictEqual(nonStructural.damage, 2);
});
