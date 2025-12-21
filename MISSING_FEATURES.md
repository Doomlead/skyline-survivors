# Skyline Survivors – Design Gap Analysis

Scope: Differences between the playable prototype and the core goals outlined in `DesignDocument.txt` (system map + Defender-style loop, co-op turret play, meta progression, branching upgrades, accessibility).

1. **System/Meta Layer & District Stakes**
   - System map is static: district timers, mothership movement, node threat escalation, and persistent destruction states are absent.
   - District selection does not seed mission parameters (threat level, objectives, rewards) or unlock paths toward the enemy base assault.
   - No between-mission build/shop layer or meta persistence to track cleared districts and fallout from failures.

2. **Co-op, Ship Forms, and Survival Loops**
   - Only single-ship play exists; there is no two-player flow, shared resources, or revive/pilot-pod mechanics.
   - Turret form, linked turret behavior, and fighter↔turret switching are missing.
   - No co-op-specific UI hooks (dual HUD, radar clarity, silhouettes) mentioned in the design goals.

3. **Rescue/Comrade Systems**
   - Rescues only grant score; comrades do not fight alongside the player, hang from the ship, or require escort/extraction loops.
   - No mutation/reconversion mechanics or district-based rescue stakes that influence system outcomes.

4. **Weapons, Upgrades, and Build Crafting**
   - Power-ups are linear and temporary; there are no branching upgrade paths, satellite positioning, or shop-driven builds tied to the build screen.
   - Weapon tuning levers from the design (capsule vs surface pickups, satellite shop) are not represented.

5. **Missions, Bosses, and Progression Flow**
   - Only a single endless side-scrolling map exists; district-biome variations, challenge missions, boss rush, and the enemy base assault are missing.
   - Clearing thresholds that unlock the base assault and difficulty scaling from destroyed districts are not implemented.

6. **UI/UX & Meta Feedback**
   - HUD lacks system-layer indicators (flashing threatened nodes, destroyed districts) and post-mission summaries.
   - No persistence scaffolding for unlocks, cosmetics, or difficulty modifiers tied to system performance.

7. **Options & Accessibility**
   - Added main-menu volume sliders (music/SFX), mute toggle wiring, and a persistent reduce-screen-flashes toggle saved to local storage.
   - Still missing: key remapping, color-blind palettes, subtitle/captioning, and in-game quick-accessibility presets.

These gaps remain the highest-impact areas to build toward the full Strike Force–inspired design vision.
