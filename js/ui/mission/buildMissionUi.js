class BuildMissionUi {
    constructor(scene) {
        this.scene = scene;
        this.modeButtons = null;
        this.modeButtonRefs = [];
        this.modeHint = null;
        this.detailCard = null;
        this.detailTitle = null;
        this.detailBody = null;
        this.missionHeader = null;
        this.panelSummary = null;
        this.missionDetails = null;
        this.nodeStatusText = null;
        this.launchButton = null;
        this.rollButton = null;
        this.onModeSelected = null;
        this.shopPanel = null;
        this.creditsText = null;
        this.loadoutButtons = { offense: [], defense: [] };
        this.shopItemRows = [];
    }

    createOverlay(width) {
        const header = this.scene.add.text(width / 2, 24, 'District + Build Map', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: '#8bffff',
            align: 'center'
        }).setOrigin(0.5);
        header.setShadow(0, 0, '#0ea5e9', 8, true, true);

        this.detailCard = this.scene.add.rectangle(width / 2, 52, 560, 96, 0x0b1220, 0.7)
            .setStrokeStyle(1.5, 0x1d4ed8, 0.8);
        this.detailCard.setOrigin(0.5, 0);
        this.detailCard.setScrollFactor(0);

        this.detailTitle = this.scene.add.text(width / 2 - 260, 64, 'Select a district', {
            fontFamily: 'Orbitron',
            fontSize: '15px',
            color: '#c7e3ff'
        });
    }

    createModeButtons(width, selectedMode) {
        this.modeButtons = this.scene.add.container(width * 0.42, 168);
        this.modeButtonRefs = [];

        const createButton = (offsetX, label, color, mode) => {
            const rect = this.scene.add.rectangle(offsetX, 0, 150, 38, 0x0f172a, 0.85)
                .setStrokeStyle(2, color, 0.7)
                .setInteractive({ useHandCursor: true });
            const text = this.scene.add.text(offsetX, 0, label, {
                fontFamily: 'Orbitron',
                fontSize: '12px',
                color: '#d1f6ff'
            }).setOrigin(0.5);

            rect.on('pointerover', () => {
                this.scene.tweens.add({ targets: rect, alpha: 1, duration: 120 });
            });
            rect.on('pointerout', () => {
                this.scene.tweens.add({ targets: rect, alpha: 0.85, duration: 160 });
            });
            rect.on('pointerdown', () => this.onModeSelected?.(mode));

            this.modeButtonRefs.push({ rect, text, mode, color });
            this.modeButtons.add([rect, text]);
        };

        createButton(-90, 'Wave Mode', 0x7dd3fc, 'classic');
        createButton(90, 'Survival Mode', 0x22d3ee, 'survival');

        this.modeHint = this.scene.add.text(width * 0.42, 208,
            'Select a district to deploy and then choose your mode.', {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#9fb8d1',
                wordWrap: { width: 360 },
                lineSpacing: 4
            }).setOrigin(0.5);

        this.updateModeButtonStyles(selectedMode);
    }

    createDetailBody(width, mapNodes) {
        const hasTimedNodes = (typeof missionPlanner !== 'undefined' && missionPlanner.hasMapTimerData()) && mapNodes.some(
            node => (node.state?.timer || 0) > 0);
        const overlayDescription = hasTimedNodes
            ? 'Click a glowing sector to select it. Drag to rotate the globe.\nNodes with active timers will destabilize—stabilize the most critical threats first.\nChoose a mode below to deploy to the selected district.'
            : 'Click a glowing sector to select it. Drag to rotate the globe.\nThis map is static for now—select a sector and prep a deployment when ready.\nChoose a mode below to deploy to the selected district.';

        this.detailBody = this.scene.add.text(width / 2 - 260, 94, overlayDescription, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#9fb8d1',
            wordWrap: { width: 520 },
            lineSpacing: 6
        });
    }

    createMissionConsole(width, height, { onLaunch, onReroute }) {
        const panelWidth = width * 0.36;
        const panelHeight = height * 0.64;
        const panelX = width * 0.82;
        const panelY = height * 0.46;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0c1e34, 0.85);
        panel.setStrokeStyle(3, 0x33c0ff, 0.8);
        const inner = this.scene.add.rectangle(panelX, panelY, panelWidth - 16, panelHeight - 16, 0x07162b, 0.9);
        inner.setStrokeStyle(2, 0x0a85ff, 0.3);

        this.missionHeader = this.scene.add.text(panelX, panelY - panelHeight / 2 + 18, 'Mission & Build Routing', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#c7e3ff'
        }).setOrigin(0.5);

        this.panelSummary = this.scene.add.text(panelX, panelY - panelHeight * 0.05, '', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb',
            align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5);

        this.missionDetails = this.scene.add.text(panelX, panelY + panelHeight * 0.12, '', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb',
            align: 'center',
            wordWrap: { width: panelWidth - 30 }
        }).setOrigin(0.5);

        this.nodeStatusText = this.scene.add.text(panelX, panelY + panelHeight * 0.29, '', {
            fontFamily: 'Orbitron',
            fontSize: '10px',
            color: '#9fb8d1',
            align: 'center',
            lineSpacing: 2,
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5);

        this.launchButton = this.createMissionButton(panelX, panelY + panelHeight * 0.43, 'Launch Deployment (Space)', 0x22d3ee, onLaunch);
        this.rollButton = this.createMissionButton(panelX, panelY + panelHeight * 0.55, 'Reroll New City (R)', 0xf97316, onReroute);

        this.scene.add.text(panelX, height - 24, 'Select a district, pick a mode, then launch.', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0.5);
    }

    createBuildShopPanel(width, height) {
        const panelWidth = width * 0.46;
        const panelHeight = 230;
        const panelX = width * 0.78;
        const panelY = height - panelHeight / 2 - 12;

        this.shopPanel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0b1220, 0.8);
        this.shopPanel.setStrokeStyle(2, 0x0ea5e9, 0.6);
        this.shopPanel.setDepth(4);

        this.scene.add.text(panelX - panelWidth / 2 + 12, panelY - panelHeight / 2 + 8, 'Between-Mission Build & Shop', {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            color: '#8bffff'
        }).setOrigin(0, 0);

        this.creditsText = this.scene.add.text(panelX + panelWidth / 2 - 12, panelY - panelHeight / 2 + 10, 'Credits: --', {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#fef08a'
        }).setOrigin(1, 0);

        const loadoutY = panelY - 25;
        this.createLoadoutColumn(panelX - panelWidth * 0.22, loadoutY, 'offense', 'Offense Loadout');
        this.createLoadoutColumn(panelX + panelWidth * 0.08, loadoutY, 'defense', 'Defense Loadout');

        const shopStartY = panelY + 40;
        this.scene.add.text(panelX - panelWidth / 2 + 12, shopStartY - 22, 'Shop Unlocks (Orbit Node)', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0, 0.5);

        const inventory = window.metaProgression?.getShopInventory?.() || [];
        const rowWidth = panelWidth - 30;
        this.shopItemRows = inventory.map((item, idx) => {
            const y = shopStartY + idx * 34;
            const row = this.scene.add.rectangle(panelX, y, rowWidth, 30, 0x0f172a, 0.85)
                .setStrokeStyle(1.5, 0x1dcaff, 0.35)
                .setInteractive({ useHandCursor: true });
            const nameText = this.scene.add.text(panelX - rowWidth / 2 + 10, y - 6, item.name, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#dceefb'
            }).setOrigin(0, 0.5);
            const stateText = this.scene.add.text(panelX - rowWidth / 2 + 10, y + 8, '', {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: '#94a3b8'
            }).setOrigin(0, 0.5);

            row.on('pointerdown', () => this.purchaseItem(item.id));
            return { id: item.id, row, nameText, stateText };
        });
    }

    createLoadoutColumn(x, y, slot, title) {
        this.scene.add.text(x - 90, y - 18, title, {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0, 0.5);

        const options = window.metaProgression?.getLoadoutOptions?.()?.[slot] || [];
        const baseOptions = options.length ? options : [
            { id: `${slot}-base`, name: 'Standard', description: 'Standard issue', unlocked: true, equipped: true }
        ];
        this.loadoutButtons[slot] = baseOptions.map((option, idx) => {
            const btnY = y + idx * 30;
            const rect = this.scene.add.rectangle(x, btnY, 200, 26, 0x0f172a, 0.85)
                .setStrokeStyle(1.5, 0x22d3ee, 0.55)
                .setInteractive({ useHandCursor: true });
            const label = this.scene.add.text(x - 92, btnY, option.name, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#dceefb'
            }).setOrigin(0, 0.5);
            const desc = this.scene.add.text(x + 10, btnY, option.description || '', {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: '#94a3b8'
            }).setOrigin(0, 0.5);

            rect.on('pointerdown', () => {
                if (window.metaProgression?.setEquippedLoadout && option.unlocked !== false) {
                    const changed = metaProgression.setEquippedLoadout(slot, option.id);
                    if (changed) {
                        this.refreshBuildShopPanel();
                        this.highlightShopPanel();
                    }
                }
            });

            return { slot, optionId: option.id, rect, label, desc };
        });
    }

    createMissionButton(x, y, label, strokeColor, handler) {
        const button = this.scene.add.rectangle(x, y, 240, 38, 0x0f172a, 0.9)
            .setStrokeStyle(2, strokeColor, 0.8)
            .setInteractive({ useHandCursor: true })
            .setDepth(5);
        const text = this.scene.add.text(x, y, label, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#dceefb'
        }).setOrigin(0.5).setDepth(5);

        button.on('pointerover', () => {
            this.scene.tweens.add({ targets: button, alpha: 1, duration: 120 });
        });
        button.on('pointerout', () => {
            this.scene.tweens.add({ targets: button, alpha: 0.9, duration: 120 });
        });
        if (handler) {
            button.on('pointerdown', () => handler());
        }

        return { button, text };
    }

    updateModeButtonStyles(selectedMode) {
        if (!this.modeButtonRefs) return;
        this.modeButtonRefs.forEach(({ rect, text, mode, color }) => {
            const active = mode === selectedMode;
            rect.setFillStyle(0x0f172a, active ? 1 : 0.85);
            rect.setStrokeStyle(2, color, active ? 1 : 0.6);
            rect.setScale(active ? 1.02 : 1);
            text.setColor(active ? '#e0f2fe' : '#d1f6ff');
        });
    }

    updateDetail(title, body) {
        if (this.detailTitle) this.detailTitle.setText(title);
        if (this.detailBody) this.detailBody.setText(body);
    }

    refreshNodeStatusText(mapNodes, selectedDistrict) {
        if (!this.nodeStatusText) return;
        const lines = mapNodes.map(node => {
            const statusLabel = node.state.status === 'occupied'
                ? 'OCCUPIED'
                : node.state.status === 'friendly'
                    ? 'FRIENDLY'
                    : node.state.timer > 0
                        ? `T-${this.scene.formatTimer(node.state.timer)}`
                        : 'THREATENED';
            return `${node.config.label}: ${statusLabel}`;
        });
        const district = selectedDistrict ? `${selectedDistrict.config.name}: ${selectedDistrict.state.status.toUpperCase()}` : 'No district selected';
        this.nodeStatusText.setText([
            'Unified Map Status',
            district,
            ...lines
        ].join('\n'));
    }

    updateMissionUi(mission, selectedMode, selectedDistrict, mapNodes) {
        if (!mission || !this.panelSummary) return;

        const modeToUse = mission.mode || selectedMode;
        const { city, latitude, longitude, seed, directives } = mission;
        const mode = mission.mode || selectedMode;
        const modeLabel = mode === 'survival' ? 'Survival' : mode === 'assault' ? 'Assault' : 'Wave';
        const directiveLabel = directives?.urgency ? `${directives.urgency.toUpperCase()} THREAT` : 'Threat mix pending';
        const rewardLabel = directives?.rewardMultiplier ? `${directives.rewardMultiplier.toFixed(2)}x rewards · ${directives.reward}` : 'Standard rewards';
        const launchLabel = mode === 'survival'
            ? 'Launch Survival Run (Space)'
            : mode === 'assault'
                ? 'Launch Assault Run (Space)'
                : 'Launch Wave Run (Space)';

        this.panelSummary.setText(
            `${city}\nLat ${latitude.toFixed(1)} · Lon ${longitude.toFixed(1)}\nSeed ${seed.slice(0, 6)}`
        );
        this.missionDetails.setText(
            `${modeLabel} Mode — ${directiveLabel}\n${rewardLabel}`
        );
        this.refreshNodeStatusText(mapNodes, selectedDistrict);
        if (this.launchButton?.text) {
            this.launchButton.text.setText(launchLabel);
        }
        this.updateModeButtonStyles(modeToUse);
    }

    updateExternalLaunchButton(selectedDistrict, mission, selectedMode) {
        const btn = document.getElementById('build-launch');
        if (!btn) return;
        const hasSelection = !!selectedDistrict;
        const mode = mission?.mode || selectedMode;
        const labelMode = mode === 'survival' ? 'Survival' : mode === 'assault' ? 'Assault' : 'Wave';
        const districtName = selectedDistrict?.config?.name || 'mission';
        btn.disabled = !hasSelection;
        btn.textContent = hasSelection
            ? `Launch ${labelMode} Run — ${districtName}`
            : 'Select a district to launch';
        btn.classList.toggle('opacity-50', !hasSelection);
        btn.classList.toggle('cursor-not-allowed', !hasSelection);
    }

    refreshBuildShopPanel() {
        if (!this.shopPanel) return;
        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        const options = window.metaProgression?.getLoadoutOptions?.() || { offense: [], defense: [] };
        const inventory = window.metaProgression?.getShopInventory?.() || [];

        if (this.creditsText) {
            this.creditsText.setText(`Credits: ${meta.credits}`);
        }

        ['offense', 'defense'].forEach(slot => {
            const slotOptions = options[slot] || [];
            this.loadoutButtons[slot]?.forEach(btn => {
                const option = slotOptions.find(o => o.id === btn.optionId);
                const unlocked = option ? option.unlocked !== false : true;
                const equipped = option ? !!option.equipped : btn.optionId.includes('base');
                btn.rect.setStrokeStyle(1.5, equipped ? 0x8b5cf6 : 0x22d3ee, unlocked ? 0.9 : 0.3);
                btn.rect.setFillStyle(0x0f172a, unlocked ? 0.9 : 0.4);
                btn.label.setColor(unlocked ? '#dceefb' : '#475569');
                btn.desc.setColor(unlocked ? '#94a3b8' : '#475569');
                if (unlocked && !btn.rect.input?.enabled) btn.rect.setInteractive({ useHandCursor: true });
                if (!unlocked && btn.rect.input?.enabled) btn.rect.disableInteractive();
                if (option && option.description) {
                    btn.desc.setText(option.description);
                }
            });
        });

        this.shopItemRows.forEach(row => {
            const item = inventory.find(i => i.id === row.id);
            if (!item) return;
            const owned = !!item.owned;
            const affordable = !!item.affordable;
            const stateLabel = owned
                ? 'Unlocked'
                : affordable
                    ? `Purchase: ${item.cost} credits`
                    : `Need ${item.cost - (meta.credits || 0)} more credits`;
            row.stateText.setText(stateLabel);
            row.stateText.setColor(owned ? '#a7f3d0' : affordable ? '#fef3c7' : '#fca5a5');
            row.row.setStrokeStyle(1.5, owned ? 0x22c55e : 0x1dcaff, owned ? 0.6 : 0.4);
            row.row.setFillStyle(0x0f172a, owned ? 0.6 : 0.85);
            if (owned && row.row.input?.enabled) row.row.disableInteractive();
            if (!owned && !row.row.input?.enabled) row.row.setInteractive({ useHandCursor: true });
        });
    }

    highlightShopPanel() {
        if (!this.shopPanel) return;
        this.scene.tweens.add({
            targets: this.shopPanel,
            scale: { from: 1, to: 1.02 },
            alpha: { from: 0.9, to: 1 },
            duration: 180,
            yoyo: true
        });
    }

    purchaseItem(itemId) {
        if (!window.metaProgression?.purchaseShopItem) return;
        const result = metaProgression.purchaseShopItem(itemId);
        if (result.success) {
            this.updateDetail('Shop Acquisition', `${result.item.name} unlocked. Equip its loadout on the left.`);
            this.highlightShopPanel();
        } else if (result.reason === 'insufficient_funds') {
            if (this.creditsText) {
                this.scene.tweens.add({
                    targets: this.creditsText,
                    scale: { from: 1, to: 1.08 },
                    duration: 140,
                    yoyo: true
                });
            }
        }
        this.refreshBuildShopPanel();
    }
}
