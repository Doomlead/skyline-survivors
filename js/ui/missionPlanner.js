(function() {
    const cities = [
        'Neo Seattle', 'Skyline Prime', 'Aurora City', 'Nightfall Bay', 'Nova Odessa',
        'Celestia Station', 'Obsidian Ridge', 'Atlas Spire', 'Horizon Arc', 'Lumen Harbor'
    ];

    const STORAGE_KEY = 'skyline_district_state';

    const DISTRICT_CONFIGS = [
        { id: 'north-spire', name: 'North Spire', angle: -60, start: -100, end: -20, timer: 120, color: 0x22e0ff, threats: ['lander', 'mutant', 'drone'], reward: 'tech caches' },
        { id: 'eastern-reach', name: 'Eastern Reach', angle: 30, start: -10, end: 70, timer: 150, color: 0x7c3aed, threats: ['lander', 'bomber', 'turret'], reward: 'energy cells' },
        { id: 'sunward-forge', name: 'Sunward Forge', angle: 110, start: 80, end: 140, timer: 90, color: 0xfbbf24, threats: ['drone', 'kamikaze', 'seeker'], reward: 'forge alloys' },
        { id: 'southern-bastion', name: 'Southern Bastion', angle: 180, start: 150, end: 220, timer: 180, color: 0x10b981, threats: ['lander', 'shield', 'shielder'], reward: 'defense cores' },
        { id: 'shadow-belt', name: 'Shadow Belt', angle: 275, start: 230, end: 320, timer: 200, color: 0xef4444, threats: ['pod', 'swarmer', 'baiter'], reward: 'stealth intel' }
    ];

    let mission = null;
    let districtState = null;
    const mapState = { nodes: {}, hasTimerData: false };

    function getDefaultDistrictState(config) {
        return {
            id: config.id,
            status: 'threatened',
            timer: config.timer,
            lastOutcome: null,
            clearedRuns: 0
        };
    }

    function safeLoadState() {
        if (districtState) return districtState;
        let stored = null;
        if (typeof localStorage !== 'undefined') {
            try {
                stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            } catch (err) {
                stored = null;
            }
        }

        const now = Date.now();
        const lastUpdated = stored?.lastUpdated || now;
        const elapsed = Math.max(0, (now - lastUpdated) / 1000);

        districtState = { lastUpdated: now, districts: {} };
        DISTRICT_CONFIGS.forEach(cfg => {
            const existing = stored?.districts?.[cfg.id];
            const base = existing ? { ...existing } : getDefaultDistrictState(cfg);
            if (base.status !== 'destroyed') {
                base.timer = Math.max(0, base.timer - elapsed);
                if (base.timer === 0) {
                    base.status = 'destroyed';
                    base.lastOutcome = 'failed';
                }
            }
            districtState.districts[cfg.id] = base;
        });

        return districtState;
    }

    function persistState() {
        if (typeof localStorage === 'undefined' || !districtState) return;
        try {
            const payload = { ...districtState, lastUpdated: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            // Ignore persistence errors in environments without storage
        }
    }

    function randomCityMission() {
        const districtConfig = Phaser.Utils.Array.GetRandom(DISTRICT_CONFIGS);
        const district = getDistrictState(districtConfig.id);
        const angle = districtConfig.angle;
        const longitude = Phaser.Math.Wrap(angle, -180, 180);
        const latitude = Phaser.Math.Clamp(Math.sin(Phaser.Math.DegToRad(angle)) * 80, -80, 80);
        return {
            city: districtConfig.name,
            district: districtConfig.id,
            latitude,
            longitude,
            mode: Phaser.Utils.Array.GetRandom(['classic', 'survival']),
            seed: Phaser.Math.RND.uuid(),
            directives: buildMissionDirectives(districtConfig, district)
        };
    }

    function ensureMission() {
        if (!mission) {
            mission = randomCityMission();
        }
        return mission;
    }

    function getMission() {
        return ensureMission();
    }

    function rerollCity() {
        const current = ensureMission();
        const newMission = randomCityMission();
        newMission.mode = current.mode;
        mission = newMission;
        return mission;
    }

    function setMode(mode) {
        const current = ensureMission();
        mission = { ...current, mode };
        const cfg = getDistrictConfigById(mission.district);
        if (cfg) mission.directives = buildMissionDirectives(cfg, getDistrictState(cfg.id), mode);
        return mission;
    }

    function getDistrictConfigById(id) {
        return DISTRICT_CONFIGS.find(d => d.id === id);
    }

    function selectDistrict(name, angleDegrees = null, providedState = null) {
        const current = ensureMission();
        const config = DISTRICT_CONFIGS.find(d => d.name === name || d.id === name);
        const angle = angleDegrees !== null ? angleDegrees : (config?.angle ?? Phaser.Math.FloatBetween(-180, 180));
        const longitude = Phaser.Math.Wrap(angle, -180, 180);
        const latitude = Phaser.Math.Clamp(Math.sin(Phaser.Math.DegToRad(angle)) * 80, -80, 80);
        const districtId = config?.id || name;
        const state = providedState ? updateDistrictState(districtId, providedState) : getDistrictState(districtId);
        const directives = config ? buildMissionDirectives(config, state, current.mode) : current.directives;
        mission = {
            ...current,
            city: config?.name || name,
            district: districtId,
            longitude,
            latitude,
            seed: current.seed || Phaser.Math.RND.uuid(),
            directives,
            districtState: state
        };
        return mission;
    }

    function getDistrictState(id) {
        const state = safeLoadState();
        if (!state.districts[id]) {
            const cfg = getDistrictConfigById(id);
            state.districts[id] = cfg ? getDefaultDistrictState(cfg) : { id, status: 'threatened', timer: 90 };
        }
        return state.districts[id];
    }

    function updateDistrictState(id, patch) {
        const state = safeLoadState();
        const existing = getDistrictState(id);
        state.districts[id] = { ...existing, ...patch };
        state.lastUpdated = Date.now();
        persistState();
        return state.districts[id];
    }

    function getAllDistrictStates() {
        safeLoadState();
        return DISTRICT_CONFIGS.map(cfg => ({ config: cfg, state: getDistrictState(cfg.id) }));
    }

    function buildMissionDirectives(config, state, modeOverride = null) {
        if (!config || !state) return null;
        const timerRatio = config.timer > 0 ? Math.max(0, state.timer) / config.timer : 0;
        const urgency = state.status === 'destroyed' ? 'collapse' : timerRatio < 0.35 ? 'critical' : 'threatened';
        const rewardMultiplier = urgency === 'collapse' ? 1.5 : urgency === 'critical' ? 1.25 : 1;
        const spawnMultiplier = urgency === 'collapse' ? 1.35 : urgency === 'critical' ? 1.15 : 1;
        const humans = urgency === 'collapse' ? 20 : urgency === 'critical' ? 18 : 15;
        const focusedTypes = [...config.threats];
        if (urgency !== 'threatened') {
            focusedTypes.push('bomber', 'kamikaze');
        }
        if (urgency === 'collapse') {
            focusedTypes.push('shield', 'spawner');
        }

        const threatMix = focusedTypes.map(type => ({ type, weight: 2 }));
        threatMix.push({ type: 'lander', weight: 1 });
        threatMix.push({ type: 'mutant', weight: 1 });

        return {
            districtId: config.id,
            districtName: config.name,
            reward: config.reward,
            urgency,
            rewardMultiplier,
            spawnMultiplier,
            humans,
            timer: state.timer,
            status: state.status,
            mode: modeOverride,
            districtState: { ...state },
            threatMix
        };
    }

    function tickDistricts(seconds = 0) {
        const state = safeLoadState();
        let mutated = false;
        Object.values(state.districts).forEach((entry) => {
            if (entry.status === 'destroyed') return;
            if (entry.timer > 0 && seconds > 0) {
                entry.timer = Math.max(0, entry.timer - seconds);
                mutated = true;
            }
            if (entry.timer === 0 && entry.status !== 'destroyed') {
                entry.status = 'destroyed';
                mutated = true;
            }
        });
        if (mutated) {
            state.lastUpdated = Date.now();
            persistState();
        }
    }

    function recordMissionOutcome(success) {
        const currentMission = mission;
        if (!currentMission?.district) return;
        const cfg = getDistrictConfigById(currentMission.district);
        const state = getDistrictState(currentMission.district);
        if (!cfg) return;

        if (success) {
            state.status = 'cleared';
            state.timer = cfg.timer + 60;
            state.clearedRuns = (state.clearedRuns || 0) + 1;
            state.lastOutcome = 'cleared';
        } else {
            state.timer = Math.max(0, state.timer - cfg.timer * 0.35);
            state.lastOutcome = 'failed';
            if (state.timer === 0) {
                state.status = 'destroyed';
            } else {
                state.status = 'threatened';
            }
        }

        districtState.lastUpdated = Date.now();
        persistState();
        mission = {
            ...currentMission,
            directives: buildMissionDirectives(cfg, state, currentMission.mode),
            districtState: { ...state }
        };
    }

    function prepareLaunchPayload(mode) {
        const current = setMode(mode || ensureMission().mode || 'classic');
        const cfg = getDistrictConfigById(current.district);
        const state = cfg ? getDistrictState(cfg.id) : null;
        return {
            ...current,
            directives: cfg ? buildMissionDirectives(cfg, state, mode) : current.directives,
            districtState: state ? { ...state } : null,
            mapState
        };
    }

    function ensureMapNodeState(config) {
        const existing = mapState.nodes[config.id];
        if (existing) return existing;
        const status = config.timer > 0 ? 'threatened' : 'stable';
        mapState.nodes[config.id] = {
            id: config.id,
            label: config.label,
            timer: config.timer || 0,
            status,
            rewardModifier: config.rewardModifier || 1,
            spawnModifier: config.spawnModifier || 1,
            lastUpdated: Date.now()
        };
        return mapState.nodes[config.id];
    }

    function setMapTimerDataAvailable(hasTimerData) {
        mapState.hasTimerData = !!hasTimerData;
        return mapState.hasTimerData;
    }

    function updateMapNodeState(id, patch = {}) {
        const node = mapState.nodes[id];
        if (!node) return null;
        mapState.nodes[id] = { ...node, ...patch, lastUpdated: Date.now() };
        return mapState.nodes[id];
    }

    function getMapNodeState(id) {
        return mapState.nodes[id] || null;
    }

    function getMapState() {
        return mapState;
    }

    function hasMapTimerData() {
        return !!mapState.hasTimerData;
    }

    window.missionPlanner = {
        ensureMission,
        getMission,
        rerollCity,
        setMode,
        selectDistrict,
        getDistrictConfigs: () => DISTRICT_CONFIGS,
        getAllDistrictStates,
        getDistrictState,
        updateDistrictState,
        buildMissionDirectives,
        recordMissionOutcome,
        prepareLaunchPayload,
        tickDistricts,
        ensureMapNodeState,
        updateMapNodeState,
        getMapNodeState,
        getMapState,
        hasMapTimerData,
        setMapTimerDataAvailable
    };
})();
