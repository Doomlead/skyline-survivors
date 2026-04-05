const STRUCTURAL_ASSAULT_ROLES = Object.freeze([
    'shield',
    'turret',
    'core',
    'stasis_array',
    'prisoner_transport',
    'power_conduit',
    'security_node',
    'interior_core'
]);

const STRUCTURAL_SIEGE_MULTIPLIERS = Object.freeze({
    shield: 1.55,
    turret: 1.45,
    core: 1.35,
    stasis_array: 1.35,
    prisoner_transport: 1.3,
    power_conduit: 1.4,
    security_node: 1.35,
    interior_core: 1.3,
    default: 1.3
});

function isStructuralAssaultRole(role) {
    return STRUCTURAL_ASSAULT_ROLES.includes(role);
}

function getBulwarkSiegeMultiplier(role) {
    if (!isStructuralAssaultRole(role)) return 1;
    return STRUCTURAL_SIEGE_MULTIPLIERS[role] || STRUCTURAL_SIEGE_MULTIPLIERS.default;
}

function shouldApplyBulwarkSiegeBonus(projectile, targetRole, aegisSnapshot) {
    if (!isStructuralAssaultRole(targetRole)) return false;
    const sourceMode = projectile?.sourceMode;
    if (sourceMode) return sourceMode === 'bulwark';
    return Boolean(aegisSnapshot?.active && aegisSnapshot?.mode === 'bulwark');
}

function computeBulwarkSiegeDamage(baseDamage, targetRole, projectile, aegisSnapshot) {
    const safeBase = Number.isFinite(baseDamage) ? baseDamage : 1;
    if (!shouldApplyBulwarkSiegeBonus(projectile, targetRole, aegisSnapshot)) {
        return { damage: safeBase, multiplier: 1, applied: false };
    }
    const multiplier = getBulwarkSiegeMultiplier(targetRole);
    return {
        damage: safeBase * multiplier,
        multiplier,
        applied: multiplier > 1
    };
}

const exported = {
    STRUCTURAL_ASSAULT_ROLES,
    STRUCTURAL_SIEGE_MULTIPLIERS,
    isStructuralAssaultRole,
    getBulwarkSiegeMultiplier,
    shouldApplyBulwarkSiegeBonus,
    computeBulwarkSiegeDamage
};

if (typeof module !== 'undefined') {
    module.exports = exported;
}

if (typeof window !== 'undefined') {
    window.assaultSiegeRules = exported;
}
