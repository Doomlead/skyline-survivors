(function registerGlobeOrbitNodes(global) {
    function createOrbitNodes(view) {
        if (typeof missionPlanner === 'undefined') return;

        view.nodeConfigs = [
            { id: 'battleship', label: 'Battleship', angle: -40, distScale: 1.6, color: 0xf472b6 },
            { id: 'shop', label: 'Shop', angle: 70, distScale: 1.8, color: 0x22d3ee },
            { id: 'relay', label: 'Relay', angle: 160, distScale: 1.7, color: 0x93c5fd },
            { id: 'distress', label: 'Distress Node', angle: 240, distScale: 1.5, color: 0xfacc15 },
            { id: 'mothership', label: 'Mothership', angle: 300, distScale: 1.95, color: 0x818cf8 }
        ];

        view.nodeConfigs.forEach(config => {
            const connector = view.scene.add.graphics();
            const node = view.scene.add.circle(0, 0, 12, config.color, 0.9);
            node.setStrokeStyle(2, 0xffffff, 0.8);
            node.setBlendMode(Phaser.BlendModes.ADD);
            const pulse = view.scene.tweens.add({ targets: node, scale: 1.25, duration: 700, yoyo: true, repeat: -1 });

            const label = view.scene.add.text(0, 0, config.label, {
                fontFamily: 'Orbitron', fontSize: '12px', color: '#c7e6ff', align: 'center'
            }).setOrigin(0.5).setDepth(5);

            const timerText = view.scene.add.text(0, 0, '--', {
                fontFamily: 'Orbitron', fontSize: '11px', color: '#ffffff'
            }).setOrigin(0.5).setDepth(5);

            const nodeState = missionPlanner.ensureMapNodeState(config);

            view.mapNodes.push({ id: config.id, config, node, label, timerText, pulse, connector, state: nodeState, isEnabled: true });

            node.setInteractive({ useHandCursor: true });
            node.on('pointerdown', () => {
                flashConnector(view, connector);
                const liveState = missionPlanner.getMapNodeState(config.id) || nodeState;
                view.onOrbitNodeSelected?.(config.id, liveState);
            });
        });

        updateOrbitNodesPositions(view);
    }

    function updateOrbitNodesPositions(view) {
        view.mapNodes.forEach(mapNode => {
            const config = mapNode.config;
            const radius = view.globeRadius * config.distScale;

            const x = view.centerX + Math.cos(Phaser.Math.DegToRad(config.angle)) * radius;
            const y = view.centerY + Math.sin(Phaser.Math.DegToRad(config.angle)) * radius;

            mapNode.node.setPosition(x, y);
            mapNode.label.setPosition(x, y - 26);
            mapNode.timerText.setPosition(x, y + 18);

            mapNode.connector.clear();
            mapNode.connector.lineStyle(1.5, 0x1dcaff, 0.3);
            mapNode.connector.lineBetween(view.centerX, view.centerY, x, y);
        });
    }

    function flashConnector(view, connector) {
        view.scene.tweens.add({
            targets: connector,
            alpha: { from: 0.35, to: 1 },
            duration: 250,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    global.GlobeOrbitNodes = {
        createOrbitNodes,
        flashConnector,
        updateOrbitNodesPositions
    };
})(window);
