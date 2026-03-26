# Container Coupling Audit: `game-container` vs `district-game-container`

Date: 2026-03-25

## 1) Modules audited

Primary modules examined for potential coupling:

- `js/core/game.js`
- `js/core/gameBootstrap.js`
- `js/core/utility.js`
- `js/ui/gameLayoutManager.js`
- `partials/game-layout.html`
- `partials/district-layout.html`
- `css/game-layout.css`
- `css/district-layout.css`

## 2) Direct dependency scan

Searches executed:

- `rg -n "district-game-container" js partials css index.html`
- `rg -n "game-container" js partials css index.html`

Findings:

- `district-game-container` appears only in district layout HTML/CSS and two JavaScript modules:
  - `js/ui/gameLayoutManager.js`
  - `js/core/gameBootstrap.js`
- `game-container` is expectedly broader (game shell, Phaser parent, responsive sizing).
- The only JavaScript modules referencing **both** container IDs are:
  - `js/ui/gameLayoutManager.js`
  - `js/core/gameBootstrap.js`

## 3) Indirect dependency analysis

Behavioral pathway checked:

- Phaser is initialized with `parent: 'game-container'`.
- District mode does not recreate Phaser; it moves the existing canvas into `#district-game-container` via `GameLayoutManager`.
- Resize behavior is mode-aware in `applyResponsiveResize()` and targets the active container.

Interpretation:

- Coupling is concentrated in two boundary modules that own layout transition and resizing.
- Core gameplay logic (`game.js`, `utility.js`) does not depend on district container specifics.

## 4) Abstractions/interfaces

Observed decoupling boundaries:

- `GameLayoutManager` exposes mode/layout operations (`switchToDistrictLayout`, `switchToGameLayout`, `getCurrentLayout`) while `DistrictLayoutManager` now focuses on district panel and mission-mode state.
- Other modules call manager methods rather than manipulating both container IDs directly.

## 5) Breakage verification / regression guard

Added automated audit tests in `tests/containerCouplingAudit.test.js` to assert:

1. `district-game-container` is only referenced by approved layout/resize modules.
2. Only approved modules reference both `game-container` and `district-game-container`.
3. Core gameplay modules do not directly depend on `district-game-container`.

This creates a repeatable guard against future unintended coupling drift.

## 6) Summary conclusion

- No unintended container coupling was found in current code.
- Existing coupling appears intentional and localized to layout orchestration (`GameLayoutManager`) and mode-specific resizing (`gameBootstrap`).
- Added tests now enforce these boundaries continuously.
