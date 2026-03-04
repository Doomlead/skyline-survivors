// --------------------------------
// js/config/interiorConfigData.js
// --------------------------------

(function() {
    const MOTHERSHIP_INTERIOR_CONFIG = {
        powerConduitCount: 4,
        securityNodeCount: 3,
        powerConduitHp: 12,
        securityNodeHp: 8,
        reinforcementInterval: 5000,
        reinforcementBatch: 2,
        coreChamberHp: 40,
        transitionDelayMs: 2500,
        oxygenDrainRate: 0,
        interiorEnemyTypes: ['seeker', 'kamikaze', 'shield', 'bomber']
    };

    const ASSAULT_INTERIOR_SECTIONS = [
        {
            id: 'security_hub',
            theme: 'Security Hub',
            length: 0.33,
            checkpoint: 'checkpoint_security_hub',
            traversalDirection: 'ltr',
            hazardSpawners: ['laser_grid', 'locked_doors'],
            enemyPool: ['base_trooper', 'turret_sentry', 'shock_drone'],
            gateRule: { type: 'kill_and_collect_key', requiredKills: 6, requiredKeys: 1 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'power_generation',
            theme: 'Power Generation',
            length: 0.34,
            checkpoint: 'checkpoint_power_generation',
            traversalDirection: 'rtl',
            hazardSpawners: ['steam_vents', 'falling_debris'],
            enemyPool: ['heavy_mech', 'electro_shocker', 'swarm_bot'],
            gateRule: { type: 'destroy_generators', requiredGenerators: 3 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'reactor_core',
            theme: 'Reactor Core',
            length: 0.33,
            checkpoint: 'checkpoint_reactor_core',
            traversalDirection: 'ltr',
            hazardSpawners: ['radiation_zone'],
            enemyPool: ['reactor_guardian', 'swarm_bot'],
            gateRule: { type: 'boss_gate', boss: 'reactor_guardian' },
            completionRule: { type: 'destroy_reactor_core' },
            bossEncounter: {
                id: 'reactor_guardian',
                phases: 1,
                shielded: true
            }
        }
    ];

    const MOTHERSHIP_INTERIOR_SECTIONS = [
        {
            id: 'hangar_bay',
            theme: 'Hangar Bay',
            length: 0.2,
            checkpoint: 'checkpoint_hangar_bay',
            traversalDirection: 'ltr',
            hazardSpawners: ['landing_clamps', 'bulkhead_lockdown'],
            enemyPool: ['mothership_grunt', 'hover_mine', 'laser_turret'],
            gateRule: { type: 'disable_bulkheads', requiredConsoles: 2 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'bio_labs',
            theme: 'Bio-Labs',
            length: 0.2,
            checkpoint: 'checkpoint_bio_labs',
            traversalDirection: 'rtl',
            hazardSpawners: ['toxic_spores', 'containment_breach'],
            enemyPool: ['mutant_test_subject', 'bio_tank', 'security_chief'],
            gateRule: { type: 'purge_labs', requiredPods: 3 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'engine_room',
            theme: 'Engine Room',
            length: 0.2,
            checkpoint: 'checkpoint_engine_room',
            traversalDirection: 'ltr',
            hazardSpawners: ['steam_jets', 'overloading_wires'],
            enemyPool: ['repair_bot', 'plasma_fodder', 'elite_engineer'],
            gateRule: { type: 'stabilize_engines', requiredNodes: 3 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'shield_control',
            theme: 'Shield Control',
            length: 0.2,
            checkpoint: 'checkpoint_shield_control',
            traversalDirection: 'rtl',
            hazardSpawners: ['rotating_shield_barrier'],
            enemyPool: ['shield_operator', 'assault_drone', 'sniper_nest_unit'],
            gateRule: { type: 'kill_linked_operators', requiredOperators: 2 },
            completionRule: { type: 'clear_gate' }
        },
        {
            id: 'central_intelligence_core',
            theme: 'Central Intelligence Core',
            length: 0.2,
            checkpoint: 'checkpoint_cic',
            traversalDirection: 'ltr',
            hazardSpawners: ['core_energy_pulse'],
            enemyPool: ['the_overseer', 'assault_drone'],
            gateRule: { type: 'boss_gate', boss: 'the_overseer' },
            completionRule: { type: 'destroy_central_intelligence_core' },
            bossEncounter: {
                id: 'the_overseer',
                phases: 3,
                patterns: ['missiles', 'summon_minions', 'mobile_charge']
            }
        }
    ];

    window.interiorConfigData = {
        MOTHERSHIP_INTERIOR_CONFIG,
        ASSAULT_INTERIOR_SECTIONS,
        MOTHERSHIP_INTERIOR_SECTIONS
    };
})();
