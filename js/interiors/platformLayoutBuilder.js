// ------------------------
// file: js/interiors/platformLayoutBuilder.js
// ------------------------
// Builds interior platforms from authored JSON layouts

function buildInteriorPlatformsFromLayout(scene, section) {
  // Handle missing section data gracefully
  if (!section) {
    console.warn('No section data provided, using fallback');
    section = {
      dimensions: { width: 1200, height: 600, groundY: 520 },
      platforms: [
        { x: 200, y: 400, width: 200, height: 16, type: 'standard' },
        { x: 600, y: 350, width: 200, height: 16, type: 'standard' }
      ],
      ladders: [
        { x: 210, y: 400, height: 120, connectsTo: [300, 400] }
      ]
    };
  }

  // Clear existing
  if (scene.platforms) {
    scene.platforms.clear?.(true, true);
  }
  if (scene.ladders) {
    scene.ladders.clear?.(true, true);
  }

  // Create new groups
  scene.platforms = scene.physics.add.staticGroup();
  scene.ladders = scene.physics.add.staticGroup();

  const dim = section?.dimensions || { width: 1200, height: 600, groundY: 520 };
  const groundY = dim.groundY || 520;
  const width = dim.width || 1200;

  // Build ground
  const ground = scene.add.rectangle(width / 2, groundY + 20, width, 40, 0x334155);
  ground.setDepth(FG_DEPTH_BASE - 1);
  scene.physics.add.existing(ground, true);
  scene.platforms.add(ground);

  // Build authored platforms
  const platforms = section?.platforms || [];
  platforms.forEach(config => {
    const color = config.type === 'bossPlatform' ? 0x553344 :
                  config.type === 'moving' ? 0x445566 : 0x666666;

    const platform = scene.add.rectangle(
      (config.x || 0) + (config.width || 100) / 2,
      (config.y || 400) + (config.height || 16) / 2,
      config.width || 100,
      config.height || 16,
      color
    );
    platform.setDepth(FG_DEPTH_BASE - 1);
    scene.physics.add.existing(platform, true);
    if (platform.body && typeof platform.body.setImmovable === 'function') {
      platform.body.setImmovable(true);
    }
    scene.platforms.add(platform);

    // Moving platform tween
    if (config.type === 'moving' && config.moveX) {
      scene.tweens.add({
        targets: platform,
        x: platform.x + config.moveX,
        duration: (Math.abs(config.moveX) / (config.speed || 30)) * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  });

  // Build ladders
  const ladders = section?.ladders || [];
  ladders.forEach(config => {
    if (typeof createInteriorLadder === 'function') {
      const ladder = createInteriorLadder(scene, {
        x: config.x || 0,
        y: (config.y || 400) + (config.height || 100),
        height: config.height || 100
      });
      if (ladder) scene.ladders.add(ladder);
    }
  });

  // Setup pilot collisions
  if (scene.pilot) {
    scene.pilotPlatformCollider = scene.physics.add.collider(scene.pilot, scene.platforms);
    if (typeof onPilotTouchLadder === 'function') {
      scene.pilotLadderOverlap = scene.physics.add.overlap(scene.pilot, scene.ladders, (player, ladder) => {
        onPilotTouchLadder(player, ladder);
      });
    }
  }

  // Set world bounds
  scene.physics.world.setBounds(0, 0, width, dim.height || 600);

  return {
    platformCount: scene.platforms.countActive ? scene.platforms.countActive() : 0,
    ladderCount: scene.ladders.countActive ? scene.ladders.countActive() : 0
  };
}

window.buildInteriorPlatformsFromLayout = buildInteriorPlatformsFromLayout;