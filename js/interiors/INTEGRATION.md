# Interior Integration Guide

## Overview
Replace procedural interior generation with authored section-based layouts.

## Files Required
```html
<!-- Add to index.html -->
<script src="js/interiors/sectionManager.js"></script>
<script src="js/interiors/hazardSystems.js"></script>
<script src="js/interiors/interiorEnemyConfig.js"></script>
<script src="js/interiors/interiorSpawner.js"></script>
<script src="js/interiors/platformLayoutBuilder.js"></script>

<!-- Add CSS -->
<link rel="stylesheet" href="css/interior-theme.css">
```

## Integration Steps

### 1. Assault Base Integration (assaultBaseCore.js)

Replace `buildInteriorPlatforms()` call in `beginAssaultBaseInterior()`:

```javascript
function beginAssaultBaseInterior(scene) {
  const objective = scene.assaultObjective;
  if (!objective) return;

  objective.interiorStarted = true;

  // Load section 0 from authored layout
  const section = interiorState.sections[0];
  
  // Build from layout instead of procedural
  buildInteriorPlatformsFromLayout(scene, section);
  
  // Spawn enemies
  spawnSectionEnemies(scene, section);
  
  // Initialize hazards
  initializeHazards(scene, section.hazards || []);
  
  // Init spawners
  initInteriorSpawners(scene);
}
```

Add to update loop:
```javascript
function updateAssaultInterior(scene, delta) {
  const time = scene.time.now;
  
  updateInteriorManager(scene, time, delta);
  updateInteriorEnemies(scene, time, delta);
  updateInteriorHazards(scene, time, delta);
}
```

### 2. Mothership Integration (mothershipCore.js)

Similar pattern for mothership interior phases.

### 3. HTML Loading Order

```javascript
// After game.js loads, load interior systems:
<script src="js/interiors/sectionManager.js"></script>
<script src="js/interiors/hazardSystems.js"></script>
<script src="js/interiors/interiorEnemyConfig.js"></script>
<script src="js/interiors/interiorSpawner.js"></script>
<script src="js/interiors/platformLayoutBuilder.js"></script>
```

## Section Data Format

See `sectionLayouts/assault/` and `sectionLayouts/mothership/` for examples.

Each section defines:
- platforms: array of {x, y, width, height, type}
- ladders: array of {x, y, height, connectsTo}
- spawnPoints: {player, enemies[], boss?}
- hazards: array of hazard configs
- reinforcements: {intervalMs, maxActive, spawnPool}
- gate: {x, y, width, height, condition}

## Testing

1. Start Assault mission, destroy base exterior
2. Verify interior loads with authored layout
3. Check platform positions match JSON
4. Verify enemies spawn at authored positions
5. Test gate progression after clearing enemies
6. Verify hazards function correctly

## Dependencies

- Phaser 3 Arcade physics
- Existing player controls (pilot state)
- Existing enemy projectile system
- Existing collision system