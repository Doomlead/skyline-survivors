// ------------------------
// File: js/entities/assault/assaultSiegeRules.js
// ------------------------

(function(root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    }
    if (root) {
        root.assaultSiegeRules = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : window, function() {
    const STRUCTURAL_ROLES = ['core', 'shield', 'turret', 'power_conduit', 'security_node', 'interior_core'];
    const BULWARK_ROLE_MULTIPLIERS = {
        core: 1.7,
        interior_core: 1.65,
        shield: 1.55,
        turret: 1.45,
        power_conduit: 1.35,
        security_node: 1.35
    };

    function isStructuralRole(role) {
        return STRUCTURAL_ROLES.includes(role);
    }

    function getBulwarkMultiplier(role) {
        if (!isStructuralRole(role)) return 1;
        return BULWARK_ROLE_MULTIPLIERS[role] || 1.3;
    }

    function resolveSiegeDamage({ baseDamage = 1, targetRole = null, firedAegisMode = null }) {
        const safeBaseDamage = Math.max(0, Number(baseDamage) || 0);
        const structure = isStructuralRole(targetRole);
        const bulwarkActive = firedAegisMode === 'bulwark';
        if (!structure || !bulwarkActive) {
            return {
                damage: safeBaseDamage,
                multiplier: 1,
                bonusApplied: false,
                telemetryTag: structure ? 'structure_hit_standard' : 'non_structure_hit'
            };
        }

        const multiplier = getBulwarkMultiplier(targetRole);
        return {
            damage: safeBaseDamage * multiplier,
            multiplier,
            bonusApplied: true,
            telemetryTag: 'bulwark_siege_hit'
        };
    }

    function getSiegeHudLabel() {
        const maxMult = Math.max(...Object.values(BULWARK_ROLE_MULTIPLIERS));
        return `SIEGE ONLINE x${maxMult.toFixed(2)}`;
    }

    return {
        STRUCTURAL_ROLES,
        BULWARK_ROLE_MULTIPLIERS,
        isStructuralRole,
        getBulwarkMultiplier,
        resolveSiegeDamage,
        getSiegeHudLabel
    };
});
