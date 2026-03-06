// ------------------------
// js/ui/missionPlanner.js
// ------------------------

(function() {
    const plannerData = window.missionPlannerData || {};
    const plannerDirectives = window.missionPlannerDirectives || {};
    const STORAGE_KEY = plannerData.STORAGE_KEY || 'skyline_district_state';
    const DISTRICT_CONFIGS = plannerData.DISTRICT_CONFIGS || [];
    const BATTLESHIP_CONFIG = plannerData.BATTLESHIP_CONFIG || {
        count: 2,
        travelTime: 26,
        assaultTime: 18,
        assaultDrain: 1.6
    };
    const CRITICAL_WINDOW_SECONDS = plannerData.CRITICAL_WINDOW_SECONDS || 30;
    const PROSPERITY_CONFIG = plannerData.PROSPERITY_CONFIG || {
        maxLevel: 6,
        gainPerSecond: 0.02,
        bonusPerLevel: 0.06,
        lossFlashSeconds: 14
    };
    const MOTHERSHIP_CONFIG = plannerData.MOTHERSHIP_CONFIG || {
        id: 'mothership',
        name: 'Mothership',
        reward: 'campaign victory',
        threatMix: ['shield', 'spawner', 'seeker', 'kamikaze', 'bomber'],
        backgroundStyle: 'mothership_exterior'
    };

    let mission = null;
    let districtState = null;
    let battleshipState = null;
    let lastIntelOutcome = null;
    const mapState = { nodes: {}, hasTimerData: false };
    const intelHelpers = window.pilotIntelProgression || null;

    function normalizeDistrictPilotIntel(entry) {
        if (intelHelpers?.normalizeDistrictIntelState) {
            intelHelpers.normalizeDistrictIntelState(entry);
            return;
        }
        entry.pilotIntel = Math.max(0, Math.floor(Number(entry.pilotIntel) || 0));
        entry.pilotIntelMilestoneIndex = Math.max(0, Math.floor(Number(entry.pilotIntelMilestoneIndex) || 0));
        entry.pilotIntelLastReward = entry.pilotIntelLastReward || null;
        entry.pilotIntelLastAwardMissionId = entry.pilotIntelLastAwardMissionId || null;
        entry.pilotIntelLastProcessedMissionId = entry.pilotIntelLastProcessedMissionId || null;
    }

    /**
     * Handles the getDefaultDistrictState routine and encapsulates its core gameplay logic.
     * Parameters: config.
     * Returns: value defined by the surrounding game flow.
     */
    function getDefaultDistrictState(config) {
        const roll = Math.random();
        const status = roll < 0.4 ? 'friendly' : 'occupied';
        const state = {
            id: config.id,
            status,
            timer: config.timer,
            criticalTimer: 0,
            prosperity: 0,
            lastProsperityLoss: 0,
            prosperityLossTimer: 0,
            lastOutcome: null,
            clearedRuns: 0,
            pilotIntel: 0,
            pilotIntelMilestoneIndex: 0,
            pilotIntelLastReward: null,
            pilotIntelLastAwardMissionId: null,
            pilotIntelLastProcessedMissionId: null
        };
        normalizeDistrictPilotIntel(state);
        syncProsperityMetrics(state);
        return state;
    }

    /**
     * Handles the syncProsperityMetrics routine and encapsulates its core gameplay logic.
     * Parameters: entry.
     * Returns: value defined by the surrounding game flow.
     */
    function syncProsperityMetrics(entry) {
        if (!entry) return;
        const level = Math.max(0, Math.floor(entry.prosperity || 0));
        entry.prosperityLevel = level;
        entry.prosperityMultiplier = 1 + level * PROSPERITY_CONFIG.bonusPerLevel;
    }

    /**
     * Handles the applyProsperityGain routine and encapsulates its core gameplay logic.
     * Parameters: entry, seconds.
     * Returns: value defined by the surrounding game flow.
     */
    function applyProsperityGain(entry, seconds = 0) {
        if (!entry || seconds <= 0) return false;
        const current = Number(entry.prosperity || 0);
        const next = Math.min(PROSPERITY_CONFIG.maxLevel, current + seconds * PROSPERITY_CONFIG.gainPerSecond);
        if (next === current) return false;
        entry.prosperity = next;
        syncProsperityMetrics(entry);
        return true;
    }

    /**
     * Handles the applyProsperityLoss routine and encapsulates its core gameplay logic.
     * Parameters: entry.
     * Returns: value defined by the surrounding game flow.
     */
    function applyProsperityLoss(entry) {
        if (!entry) return;
        const lost = Math.max(0, Math.round(entry.prosperity || 0));
        entry.lastProsperityLoss = lost;
        entry.prosperityLossTimer = PROSPERITY_CONFIG.lossFlashSeconds;
        entry.prosperity = 0;
        syncProsperityMetrics(entry);
    }

    /**
     * Handles the safeLoadState routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
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
            if (base.status === 'threatened') {
                const remaining = (base.timer ?? 0) - elapsed;
                if (remaining > 0) {
                    base.timer = remaining;
                    base.criticalTimer = 0;
                } else {
                    base.timer = 0;
                    const timePastZero = Math.abs(remaining);
                    base.criticalTimer = Math.max(0, CRITICAL_WINDOW_SECONDS - timePastZero);
                    base.status = base.criticalTimer > 0 ? 'critical' : 'occupied';
                    base.lastOutcome = base.status === 'occupied' ? 'failed' : 'critical';
                }
            }
            if (base.status === 'critical') {
                base.timer = 0;
                base.criticalTimer = Math.max(0, (base.criticalTimer ?? CRITICAL_WINDOW_SECONDS) - elapsed);
                if (base.criticalTimer === 0) {
                    base.status = 'occupied';
                    base.lastOutcome = 'failed';
                }
            }
            if (base.status === 'occupied') {
                base.timer = 0;
                base.criticalTimer = 0;
                if (base.prosperity > 0) {
                    applyProsperityLoss(base);
                }
            }
            if (base.status === 'friendly') {
                base.criticalTimer = 0;
                applyProsperityGain(base, elapsed);
            }
            if (base.prosperityLossTimer > 0) {
                base.prosperityLossTimer = Math.max(0, base.prosperityLossTimer - elapsed);
            }
            normalizeDistrictPilotIntel(base);
            syncProsperityMetrics(base);
            districtState.districts[cfg.id] = base;
        });

        return districtState;
    }

    /**
     * Handles the persistState routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function persistState() {
        if (typeof localStorage === 'undefined' || !districtState) return;
        try {
            const payload = { ...districtState, lastUpdated: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            // Ignore persistence errors in environments without storage
        }
    }

    /**
     * Handles the resetCampaignState routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function resetCampaignState() {
        districtState = null;
        battleshipState = null;
        mission = null;
        mapState.nodes = {};
        mapState.hasTimerData = false;
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
                // Ignore persistence errors in environments without storage
            }
        }
        safeLoadState();
    }

    /**
     * Handles the randomCityMission routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function randomCityMission() {
        const districtConfig = Phaser.Utils.Array.GetRandom(DISTRICT_CONFIGS);
        const district = getDistrictState(districtConfig.id);
        const center = getDistrictCenter(districtConfig);
        const longitude = Phaser.Math.Wrap(center.lon || 0, -180, 180);
        const latitude = Phaser.Math.Clamp(center.lat || 0, -85, 85);
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

    /**
     * Handles the ensureMission routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function ensureMission() {
        if (!mission) {
            mission = randomCityMission();
        }
        return mission;
    }

    /**
     * Handles the getMission routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getMission() {
        return ensureMission();
    }

    /**
     * Handles the rerollCity routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function rerollCity() {
        const current = ensureMission();
        const newMission = randomCityMission();
        newMission.mode = current.mode;
        mission = newMission;
        return mission;
    }

    /**
     * Handles the setMode routine and encapsulates its core gameplay logic.
     * Parameters: mode.
     * Returns: value defined by the surrounding game flow.
     */
    function setMode(mode) {
        const current = ensureMission();
        if (mode === 'mothership') {
            return selectMothershipMission();
        }
        mission = { ...current, mode };
        const cfg = getDistrictConfigById(mission.district);
        if (cfg) mission.directives = buildMissionDirectives(cfg, getDistrictState(cfg.id), mode);
        return mission;
    }

    /**
     * Handles the getDistrictConfigById routine and encapsulates its core gameplay logic.
     * Parameters: id.
     * Returns: value defined by the surrounding game flow.
     */
    function getDistrictConfigById(id) {
        return DISTRICT_CONFIGS.find(d => d.id === id);
    }

    /**
     * Handles the getDistrictCenter routine and encapsulates its core gameplay logic.
     * Parameters: config.
     * Returns: value defined by the surrounding game flow.
     */
    function getDistrictCenter(config) {
        if (!config) return { lat: 0, lon: 0 };
        if (config.center) return config.center;
        if (config.polygon?.length) {
            const sum = config.polygon.reduce((acc, point) => ({
                lat: acc.lat + (point.lat || 0),
                lon: acc.lon + (point.lon || 0)
            }), { lat: 0, lon: 0 });
            const count = config.polygon.length || 1;
            return { lat: sum.lat / count, lon: sum.lon / count };
        }
        return { lat: 0, lon: 0 };
    }

    /**
     * Handles the getActiveDistrictConfigs routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getActiveDistrictConfigs() {
        return DISTRICT_CONFIGS.filter(cfg => getDistrictState(cfg.id).status !== 'occupied');
    }

    /**
     * Handles the pickRandomDistrictId routine and encapsulates its core gameplay logic.
     * Parameters: excludeId.
     * Returns: value defined by the surrounding game flow.
     */
    function pickRandomDistrictId(excludeId = null) {
        const candidates = getActiveDistrictConfigs();
        const pool = candidates.length ? candidates : DISTRICT_CONFIGS;
        const options = excludeId ? pool.filter(cfg => cfg.id !== excludeId) : pool;
        const pickFrom = options.length ? options : pool;
        return Phaser.Utils.Array.GetRandom(pickFrom).id;
    }

    /**
     * Handles the ensureBattleshipState routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function ensureBattleshipState() {
        if (battleshipState) return battleshipState;
        battleshipState = Array.from({ length: BATTLESHIP_CONFIG.count }).map((_, index) => {
            const fromId = pickRandomDistrictId();
            const toId = pickRandomDistrictId(fromId);
            return {
                id: `battleship-${index + 1}`,
                active: true,
                phase: 'travel',
                fromId,
                toId,
                timer: BATTLESHIP_CONFIG.travelTime,
                lat: 0,
                lon: 0
            };
        });
        return battleshipState;
    }

    /**
     * Handles the lerpValue routine and encapsulates its core gameplay logic.
     * Parameters: start, end, t.
     * Returns: value defined by the surrounding game flow.
     */
    function lerpValue(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Handles the tickBattleships routine and encapsulates its core gameplay logic.
     * Parameters: seconds.
     * Returns: value defined by the surrounding game flow.
     */
    function tickBattleships(seconds = 0) {
        if (seconds <= 0) return ensureBattleshipState();
        const state = safeLoadState();
        const ships = ensureBattleshipState();
        const attackedDistrictIds = new Set();
        let mutated = false;

        ships.forEach(ship => {
            if (ship.active === false) return;
            if (ship.phase === 'travel') {
                ship.timer -= seconds;
                const progress = Phaser.Math.Clamp(1 - ship.timer / BATTLESHIP_CONFIG.travelTime, 0, 1);
                const fromConfig = getDistrictConfigById(ship.fromId);
                const toConfig = getDistrictConfigById(ship.toId);
                const fromCenter = getDistrictCenter(fromConfig);
                const toCenter = getDistrictCenter(toConfig);
                ship.lat = lerpValue(fromCenter.lat, toCenter.lat, progress);
                ship.lon = lerpValue(fromCenter.lon, toCenter.lon, progress);
                if (ship.timer <= 0) {
                    ship.phase = 'assault';
                    ship.timer = BATTLESHIP_CONFIG.assaultTime;
                    ship.fromId = ship.toId;
                }
            } else if (ship.phase === 'assault') {
                ship.timer -= seconds;
                const targetId = ship.fromId;
                const targetState = state.districts[targetId];
                const targetConfig = getDistrictConfigById(targetId);
                const targetCenter = getDistrictCenter(targetConfig);
                ship.lat = targetCenter.lat;
                ship.lon = targetCenter.lon;
                if (targetState?.status === 'occupied' || targetState?.lastOutcome === 'cleared') {
                    ship.active = false;
                    ship.timer = 0;
                    return;
                }
                attackedDistrictIds.add(targetId);

                if (targetState && targetState.status !== 'occupied') {
                    if (targetState.status === 'friendly') {
                        targetState.status = 'threatened';
                        targetState.timer = targetConfig?.timer || targetState.timer;
                        targetState.criticalTimer = 0;
                    }
                    const drain = seconds * BATTLESHIP_CONFIG.assaultDrain;
                    const nextTimer = Math.max(0, targetState.timer - drain);
                    if (nextTimer !== targetState.timer) {
                        targetState.timer = nextTimer;
                        if (targetState.timer === 0) {
                            targetState.status = 'critical';
                            targetState.criticalTimer = CRITICAL_WINDOW_SECONDS;
                            targetState.lastOutcome = 'critical';
                            ship.active = false;
                            ship.timer = 0;
                        }
                        mutated = true;
                    }
                }

                if (ship.timer <= 0) {
                    ship.phase = 'travel';
                    ship.toId = pickRandomDistrictId(ship.fromId);
                    ship.timer = BATTLESHIP_CONFIG.travelTime;
                }
            }
        });

        Object.entries(state.districts).forEach(([id, entry]) => {
            const underAttack = attackedDistrictIds.has(id);
            if (entry.underAttack !== underAttack) {
                entry.underAttack = underAttack;
                mutated = true;
            }
        });

        if (mutated) {
            state.lastUpdated = Date.now();
            persistState();
        }

        return ships;
    }

    /**
     * Handles the getBattleships routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getBattleships() {
        return ensureBattleshipState();
    }

    /**
     * Handles the retireBattleshipsForDistrict routine and encapsulates its core gameplay logic.
     * Parameters: districtId.
     * Returns: value defined by the surrounding game flow.
     */
    function retireBattleshipsForDistrict(districtId) {
        if (!districtId) return;
        const ships = ensureBattleshipState();
        ships.forEach(ship => {
            if (ship.active === false) return;
            if (ship.phase === 'assault' && ship.fromId === districtId) {
                ship.active = false;
                ship.timer = 0;
            }
        });
    }

    /**
     * Handles the selectDistrict routine and encapsulates its core gameplay logic.
     * Parameters: name, longitudeOverride, providedState.
     * Returns: value defined by the surrounding game flow.
     */
    function selectDistrict(name, longitudeOverride = null, providedState = null) {
        const current = ensureMission();
        const config = DISTRICT_CONFIGS.find(d => d.name === name || d.id === name);
        const center = getDistrictCenter(config);
        const longitude = Phaser.Math.Wrap(
            longitudeOverride !== null ? longitudeOverride : (center.lon || 0),
            -180,
            180
        );
        const latitude = Phaser.Math.Clamp(center.lat || 0, -85, 85);
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

    /**
     * Handles the getDistrictState routine and encapsulates its core gameplay logic.
     * Parameters: id.
     * Returns: value defined by the surrounding game flow.
     */
    function getDistrictState(id) {
        const state = safeLoadState();
        if (!state.districts[id]) {
            const cfg = getDistrictConfigById(id);
            state.districts[id] = cfg ? getDefaultDistrictState(cfg) : { id, status: 'friendly', timer: 90 };
        }
        normalizeDistrictPilotIntel(state.districts[id]);
        return state.districts[id];
    }

    /**
     * Handles the updateDistrictState routine and encapsulates its core gameplay logic.
     * Parameters: id, patch.
     * Returns: value defined by the surrounding game flow.
     */
    function updateDistrictState(id, patch) {
        const state = safeLoadState();
        const existing = getDistrictState(id);
        state.districts[id] = { ...existing, ...patch };
        state.lastUpdated = Date.now();
        persistState();
        return state.districts[id];
    }

    /**
     * Handles the getAllDistrictStates routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getAllDistrictStates() {
        safeLoadState();
        return DISTRICT_CONFIGS.map(cfg => ({ config: cfg, state: getDistrictState(cfg.id) }));
    }

    /**
     * Handles the areAllDistrictsFriendly routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function areAllDistrictsFriendly() {
        const state = safeLoadState();
        return Object.values(state.districts).every(entry => entry.status === 'friendly');
    }

    /**
     * Handles the buildMissionDirectives routine and encapsulates its core gameplay logic.
     * Parameters: config, state, modeOverride.
     * Returns: value defined by the surrounding game flow.
     */
    function buildMissionDirectives(config, state, modeOverride = null) {
        if (plannerDirectives.buildDistrictMissionDirectives) {
            return plannerDirectives.buildDistrictMissionDirectives(config, state, modeOverride);
        }

        if (!config || !state) return null;
        const urgency = state.status === 'occupied'
            ? 'occupied'
            : state.status === 'critical'
                ? 'critical'
                : state.status === 'friendly'
                    ? 'stable'
                    : 'threatened';
        const baseRewardMultiplier = urgency === 'occupied' ? 1.5 : urgency === 'critical' ? 1.25 : 1;
        const prosperityMultiplier = state.prosperityMultiplier || 1;
        const clutchDefenseBonus = urgency === 'critical' ? 0.2 : 0;
        const focusedTypes = [...(config.threats || [])];
        if (urgency !== 'threatened' && urgency !== 'stable') focusedTypes.push('bomber', 'kamikaze');
        if (urgency === 'occupied') focusedTypes.push('shield', 'spawner');
        const threatMix = focusedTypes.map(type => ({ type, weight: 2 }));
        threatMix.push({ type: 'lander', weight: 1 }, { type: 'mutant', weight: 1 });

        const intelProgress = intelHelpers?.getIntelProgressSnapshot
            ? intelHelpers.getIntelProgressSnapshot(state)
            : {
                currentIntel: state.pilotIntel || 0,
                milestoneTarget: ((state.pilotIntelMilestoneIndex || 0) + 1) * 100,
                progressRatio: Math.max(0, Math.min(1, ((state.pilotIntel || 0) % 100) / 100))
            };
        const nextRewardHint = intelHelpers?.describeNextReward
            ? intelHelpers.describeNextReward(window.metaProgression?.getPilotWeaponProfile?.() || null)
            : 'Next milestone reward pending';

        return {
            districtId: config.id,
            districtName: config.name,
            reward: config.reward,
            urgency,
            rewardMultiplier: baseRewardMultiplier * prosperityMultiplier + clutchDefenseBonus,
            clutchDefenseBonus,
            prosperityLevel: Math.max(0, state.prosperityLevel || 0),
            prosperityMultiplier,
            spawnMultiplier: urgency === 'occupied' ? 1.35 : urgency === 'critical' ? 1.15 : 1,
            humans: urgency === 'occupied' ? 10 : urgency === 'critical' ? 18 : 15,
            timer: state.timer,
            criticalTimer: state.criticalTimer ?? 0,
            prosperityLossTimer: state.prosperityLossTimer ?? 0,
            lastProsperityLoss: state.lastProsperityLoss ?? 0,
            status: state.status,
            pilotIntel: intelProgress.currentIntel,
            pilotIntelMilestoneTarget: intelProgress.milestoneTarget,
            pilotIntelProgressRatio: intelProgress.progressRatio,
            nextPilotIntelReward: nextRewardHint,
            mode: modeOverride,
            districtState: { ...state },
            threatMix
        };
    }

    /**
     * Handles the buildMothershipDirectives routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function buildMothershipDirectives() {
        if (plannerDirectives.buildMothershipMissionDirectives) {
            return plannerDirectives.buildMothershipMissionDirectives(MOTHERSHIP_CONFIG);
        }

        return {
            districtId: MOTHERSHIP_CONFIG.id,
            districtName: MOTHERSHIP_CONFIG.name,
            reward: MOTHERSHIP_CONFIG.reward,
            urgency: 'final',
            rewardMultiplier: 2.5,
            spawnMultiplier: 1.4,
            humans: 0,
            timer: null,
            status: 'core breached',
            mode: 'mothership',
            missionType: 'mothership',
            bossKey: 'mothershipCore',
            backgroundStyle: MOTHERSHIP_CONFIG.backgroundStyle,
            threatMix: (MOTHERSHIP_CONFIG.threatMix || []).map(type => ({ type, weight: 2 }))
        };
    }

    /**
     * Handles the tickDistricts routine and encapsulates its core gameplay logic.
     * Parameters: seconds.
     * Returns: value defined by the surrounding game flow.
     */
    function tickDistricts(seconds = 0) {
        const state = safeLoadState();
        let mutated = false;
        Object.values(state.districts).forEach((entry) => {
            if (entry.status === 'threatened') {
                if (entry.timer > 0 && seconds > 0) {
                    entry.timer = Math.max(0, entry.timer - seconds);
                    mutated = true;
                }
                if (entry.timer === 0 && entry.status !== 'critical') {
                    entry.status = 'critical';
                    entry.criticalTimer = CRITICAL_WINDOW_SECONDS;
                    entry.lastOutcome = 'critical';
                    mutated = true;
                }
            }
            if (entry.status === 'critical') {
                if ((entry.criticalTimer || 0) > 0 && seconds > 0) {
                    entry.criticalTimer = Math.max(0, entry.criticalTimer - seconds);
                    mutated = true;
                }
                if ((entry.criticalTimer || 0) === 0 && entry.status !== 'occupied') {
                    entry.status = 'occupied';
                    entry.lastOutcome = 'failed';
                    applyProsperityLoss(entry);
                    mutated = true;
                }
            }
            if (entry.status === 'friendly') {
                if (applyProsperityGain(entry, seconds)) {
                    mutated = true;
                }
            }
            if (entry.prosperityLossTimer > 0 && seconds > 0) {
                entry.prosperityLossTimer = Math.max(0, entry.prosperityLossTimer - seconds);
                mutated = true;
            }
        });
        if (mutated) {
            state.lastUpdated = Date.now();
            persistState();
        }
    }

    /**
     * Handles the recordMissionOutcome routine and encapsulates its core gameplay logic.
     * Parameters: success.
     * Returns: value defined by the surrounding game flow.
     */
    function recordMissionOutcome(success) {
        const currentMission = mission;
        if (!currentMission?.district) return;
        const cfg = getDistrictConfigById(currentMission.district);
        const state = getDistrictState(currentMission.district);
        if (!cfg) return;

        const missionId = `${currentMission.district}:${currentMission.seed || 'noseed'}:${currentMission.mode || 'classic'}`;
        if (state.pilotIntelLastProcessedMissionId === missionId) {
            return;
        }

        const preMissionState = { ...state };
        const intelBreakdown = intelHelpers?.computeIntelAward
            ? intelHelpers.computeIntelAward({
                success,
                directives: currentMission.directives,
                preMissionState
            })
            : {
                urgency: currentMission.directives?.urgency || 'stable',
                baseIntel: success ? 20 : 0,
                criticalBonusMultiplier: currentMission.directives?.urgency === 'critical' ? 1.5 : 1,
                occupiedSuppressed: preMissionState.status === 'occupied',
                awardIntel: preMissionState.status === 'occupied'
                    ? 0
                    : Math.round((success ? 20 : 0) * (currentMission.directives?.urgency === 'critical' ? 1.5 : 1))
            };

        if (success) {
            state.status = 'friendly';
            state.timer = cfg.timer + 60;
            state.criticalTimer = 0;
            state.clearedRuns = (state.clearedRuns || 0) + 1;
            state.lastOutcome = 'cleared';
            retireBattleshipsForDistrict(currentMission.district);
        } else {
            state.lastOutcome = 'failed';
            state.status = 'occupied';
            state.timer = 0;
            state.criticalTimer = 0;
            applyProsperityLoss(state);
            retireBattleshipsForDistrict(currentMission.district);
        }

        state.pilotIntelLastProcessedMissionId = missionId;
        state.pilotIntelLastAwardMissionId = missionId;

        const milestoneRewards = [];
        if (intelHelpers?.applyIntelAwardToState) {
            intelHelpers.applyIntelAwardToState(state, intelBreakdown.awardIntel);
            if (intelHelpers.processMilestones) {
                intelHelpers.processMilestones(state, () => {
                    const profile = window.metaProgression?.getPilotWeaponProfile?.() || null;
                    const reward = intelHelpers.resolveMilestoneReward({ profile });
                    if (!reward) return null;
                    if (reward.type === 'unlock') {
                        window.metaProgression?.grantPilotWeaponUnlock?.(reward.weapon);
                    } else if (reward.type === 'tier_token') {
                        window.metaProgression?.grantPilotWeaponTierToken?.(reward.weapon);
                    } else if (reward.type === 'ammo_cap_bonus') {
                        window.metaProgression?.grantNextDeploymentAmmoBonus?.(reward.amount || 1);
                    }
                    milestoneRewards.push(reward);
                    return reward;
                });
            }
        }

        const intelProgress = intelHelpers?.getIntelProgressSnapshot
            ? intelHelpers.getIntelProgressSnapshot(state)
            : {
                currentIntel: state.pilotIntel || 0,
                milestoneTarget: ((state.pilotIntelMilestoneIndex || 0) + 1) * 100,
                progressRatio: Math.max(0, Math.min(1, ((state.pilotIntel || 0) % 100) / 100))
            };
        const nextRewardHint = intelHelpers?.describeNextReward
            ? intelHelpers.describeNextReward(window.metaProgression?.getPilotWeaponProfile?.() || null)
            : 'Next milestone reward pending';

        lastIntelOutcome = {
            missionId,
            districtId: currentMission.district,
            success: !!success,
            urgency: intelBreakdown.urgency,
            occupiedSuppressed: !!intelBreakdown.occupiedSuppressed,
            baseIntel: intelBreakdown.baseIntel,
            awardedIntel: intelBreakdown.awardIntel,
            criticalBonusMultiplier: intelBreakdown.criticalBonusMultiplier,
            milestoneRewards,
            intelProgress,
            nextRewardHint
        };

        districtState.lastUpdated = Date.now();
        persistState();
        mission = {
            ...currentMission,
            directives: buildMissionDirectives(cfg, state, currentMission.mode),
            districtState: { ...state },
            intelOutcome: { ...lastIntelOutcome }
        };
    }

    function getLastIntelOutcome() {
        return lastIntelOutcome ? { ...lastIntelOutcome } : null;
    }

    /**
     * Handles the prepareLaunchPayload routine and encapsulates its core gameplay logic.
     * Parameters: mode.
     * Returns: value defined by the surrounding game flow.
     */
    function prepareLaunchPayload(mode) {
        if (mode === 'mothership' || mission?.district === 'mothership') {
            const mothershipMission = selectMothershipMission();
            return {
                ...mothershipMission,
                mode: 'mothership',
                directives: mothershipMission.directives,
                districtState: null,
                mapState
            };
        }
        const requestedMode = mode || ensureMission().mode || 'classic';
        const current = setMode(requestedMode);
        const cfg = getDistrictConfigById(current.district);
        const state = cfg ? getDistrictState(cfg.id) : null;
        const effectiveMode = state?.status === 'occupied' ? 'assault' : current.mode;
        return {
            ...current,
            mode: effectiveMode,
            directives: cfg ? buildMissionDirectives(cfg, state, effectiveMode) : current.directives,
            districtState: state ? { ...state } : null,
            mapState
        };
    }

    /**
     * Handles the selectMothershipMission routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function selectMothershipMission() {
        mission = {
            city: MOTHERSHIP_CONFIG.name,
            district: MOTHERSHIP_CONFIG.id,
            longitude: 0,
            latitude: 0,
            mode: 'mothership',
            seed: Phaser.Math.RND.uuid(),
            directives: buildMothershipDirectives(),
            districtState: null
        };
        return mission;
    }

    /**
     * Handles the ensureMapNodeState routine and encapsulates its core gameplay logic.
     * Parameters: config.
     * Returns: value defined by the surrounding game flow.
     */
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

    /**
     * Handles the setMapTimerDataAvailable routine and encapsulates its core gameplay logic.
     * Parameters: hasTimerData.
     * Returns: value defined by the surrounding game flow.
     */
    function setMapTimerDataAvailable(hasTimerData) {
        mapState.hasTimerData = !!hasTimerData;
        return mapState.hasTimerData;
    }

    /**
     * Handles the updateMapNodeState routine and encapsulates its core gameplay logic.
     * Parameters: id, patch.
     * Returns: value defined by the surrounding game flow.
     */
    function updateMapNodeState(id, patch = {}) {
        const node = mapState.nodes[id];
        if (!node) return null;
        mapState.nodes[id] = { ...node, ...patch, lastUpdated: Date.now() };
        return mapState.nodes[id];
    }

    /**
     * Handles the getMapNodeState routine and encapsulates its core gameplay logic.
     * Parameters: id.
     * Returns: value defined by the surrounding game flow.
     */
    function getMapNodeState(id) {
        return mapState.nodes[id] || null;
    }

    /**
     * Handles the getMapState routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function getMapState() {
        return mapState;
    }

    /**
     * Handles the hasMapTimerData routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    function hasMapTimerData() {
        return !!mapState.hasTimerData;
    }

    window.missionPlanner = {
        ensureMission,
        getMission,
        rerollCity,
        setMode,
        selectDistrict,
        selectMothershipMission,
        getDistrictConfigs: () => DISTRICT_CONFIGS,
        getAllDistrictStates,
        areAllDistrictsFriendly,
        getDistrictState,
        updateDistrictState,
        buildMissionDirectives,
        resetCampaignState,
        recordMissionOutcome,
        prepareLaunchPayload,
        tickDistricts,
        ensureMapNodeState,
        updateMapNodeState,
        getMapNodeState,
        getMapState,
        hasMapTimerData,
        setMapTimerDataAvailable,
        tickBattleships,
        getBattleships,
        getLastIntelOutcome
    };
})();
