# Interior Integration Action Plan

## What I found in the current codebase

1. **There is no dedicated `js/interiors/` module yet**.
   - Interior logic is currently spread across:
     - `js/entities/bosses/mothershipCore.js`
     - `js/entities/assault/assaultBaseCore.js`
     - `js/entities/player/buildInteriorPlatforms.js`
     - `js/graphics/levelgenerator/backgroundGenerator*Interior.js`

2. **Assault interior transition depends on mothership-global helpers**.
   - `beginAssaultBaseInterior()` in `assaultBaseCore.js` conditionally calls `clearExteriorEntities()`.
   - `updateAssaultInterior()` in `assaultBaseCore.js` calls `fireInteriorTurret()`.
   - Both helper functions are declared in `mothershipCore.js`, not in assault files.

3. **This creates a hidden load-order/runtime coupling**.
   - Today it works only because `index.html` loads `mothershipCore.js` before `assaultBaseCore.js`.
   - If script order changes (or files are bundled/scoped), transitions can fail with undefined function errors at runtime.

4. **Transition flow is duplicated for mothership + assault interiors**.
   - Both flows run the same 5 steps (clear exterior entities, swap background, build platforms, force on-foot, spawn interior objectives) with separate implementations.
   - This duplication increases drift risk and makes fixes easy to miss in one path.

## Most likely root issue behind your transition errors

The interiors are not failing because of one missing visual asset; they are failing because **interior behavior is not centralized** and currently relies on **cross-file globals** (`clearExteriorEntities`, `fireInteriorTurret`) that are owned by another encounter file.

---

## Proposed integration plan (phased)

### Phase 1 — Stabilize (no gameplay redesign)

1. Create a new shared interior module:
   - `js/interiors/interiorRuntime.js`
2. Move shared helpers into it:
   - `clearExteriorEntities(scene)`
   - `fireInteriorTurret(scene, turret)`
   - (optional) `enterInteriorCommon(scene, options)` for shared transition steps
3. Update both encounter files to consume only shared interior helpers:
   - `js/entities/bosses/mothershipCore.js`
   - `js/entities/assault/assaultBaseCore.js`
4. Add explicit guards + logging on transition start:
   - Validate `scene.assaultTargets`, `scene.enemyProjectiles`, `buildInteriorPlatforms`
   - Fail gracefully with a banner/log instead of hard crash

**Deliverable:** both transitions run with no cross-file global dependency.

### Phase 2 — Unify data contracts

1. Introduce one objective contract for interior state:
   - `interiorPhase`, `interiorStarted`, `shipLocked`
   - gate counts, `coreChamber*`, reinforcement timers
2. Implement a small helper to initialize/reset these fields in one place:
   - `initializeInteriorObjectiveState(objective, cfg)`
3. Keep mission-specific values in config only:
   - Mothership uses `MOTHERSHIP_INTERIOR_CONFIG`
   - Assault uses `ASSAULT_INTERIOR_CONFIG`

**Deliverable:** both interiors share structure, differ only by config.

### Phase 3 — Transition orchestration

1. Add a single transition entrypoint:
   - `startInteriorTransition(scene, { styleKey, bannerText, spawnObjectivesFn, objectiveRef })`
2. Internally execute ordered steps:
   - clear → background swap → parallax reset → platform build → force on-foot → objective spawn
3. Keep mission-specific objective spawns as callbacks.

**Deliverable:** one deterministic transition pipeline for all interiors.

### Phase 4 — Test hardening + diagnostics

1. Add focused tests for both transition routes:
   - `assault exterior -> assault interior`
   - `mothership exterior -> mothership interior`
2. Add regression tests for missing groups and null children:
   - no crashes if `assaultTargets`/`enemyProjectiles` are absent
3. Add temporary transition debug markers (can be env-gated):
   - timestamps for each step
   - last completed transition step in `gameState.debug`

**Deliverable:** reproducible failure points and safer runtime behavior.

---

## Implementation checklist (recommended order)

1. Add `js/interiors/interiorRuntime.js` and include it in `index.html` **before** encounter files.
2. Move shared helpers from `mothershipCore.js` into the new module.
3. Replace direct calls in `assaultBaseCore.js` and `mothershipCore.js`.
4. Add guard logs at transition entrypoints.
5. Add transition tests.
6. Remove dead/duplicate helper code from encounter files.

---

## Risk notes

- **High risk if skipped:** hidden global dependency will continue causing brittle transition failures when loading strategy changes.
- **Medium risk:** duplicated transition logic will keep diverging and produce asymmetric bugs between assault and mothership interiors.
- **Low risk migration path:** Phase 1 can be done without changing encounter gameplay tuning.
