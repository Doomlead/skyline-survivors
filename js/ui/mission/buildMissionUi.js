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
        this.dropButtons = [];
        this.pendingItemsContainer = null;
        this.historyContainer = null;
    }

    /**
     * Handles the createOverlay routine and encapsulates its core gameplay logic.
     * Parameters: width.
     * Returns: value defined by the surrounding game flow.
     */
    createOverlay(width) {
        const header = this.scene.add.text(width / 2, 24, 'District + Supply Drop', {
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

    /**
     * Handles the createModeButtons routine and encapsulates its core gameplay logic.
     * Parameters: width, selectedMode.
     * Returns: value defined by the surrounding game flow.
     */
    createModeButtons(width, selectedMode) {
        this.modeButtons = this.scene.add.container(width * 0.42, 168);
        this.modeButtonRefs = [];

        /**
         * Handles the createButton routine and encapsulates its core gameplay logic.
         * Parameters: offsetX, label, color, mode.
         * Returns: value defined by the surrounding game flow.
         */
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

        createButton(-90, 'Defense Mode', 0x7dd3fc, 'classic');
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

    /**
     * Handles the createDetailBody routine and encapsulates its core gameplay logic.
     * Parameters: width, mapNodes.
     * Returns: value defined by the surrounding game flow.
     */
    createDetailBody(width, mapNodes) {
        const hasTimedNodes = (typeof missionPlanner !== 'undefined' && missionPlanner.hasMapTimerData()) && mapNodes.some(
            node => (node.state?.timer || 0) > 0);
        const overlayDescription = hasTimedNodes
            ? 'Click a glowing sector to select it. Drag to rotate the globe.\nNodes with active timers will destabilize—stabilize the most critical threats first.\nPurchase Supply Drops below to power up your next deployment.'
            : 'Click a glowing sector to select it. Drag to rotate the globe.\nThis map is static for now—select a sector and prep a deployment when ready.\nPurchase Supply Drops below to power up your next deployment.';

        this.detailBody = this.scene.add.text(width / 2 - 260, 94, overlayDescription, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#9fb8d1',
            wordWrap: { width: 520 },
            lineSpacing: 6
        });
    }

    /**
     * Handles the createMissionConsole routine and encapsulates its core gameplay logic.
     * Parameters: width, height, onLaunch, onReroute.
     * Returns: value defined by the surrounding game flow.
     */
    createMissionConsole(width, height, { onLaunch, onReroute }) {
        const panelWidth = width * 0.36;
        const panelHeight = height * 0.64;
        const panelX = width * 0.82;
        const panelY = height * 0.46;

        const panel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0c1e34, 0.85);
        panel.setStrokeStyle(3, 0x33c0ff, 0.8);
        const inner = this.scene.add.rectangle(panelX, panelY, panelWidth - 16, panelHeight - 16, 0x07162b, 0.9);
        inner.setStrokeStyle(2, 0x0a85ff, 0.3);

        this.missionHeader = this.scene.add.text(panelX, panelY - panelHeight / 2 + 18, 'Mission Routing', {
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

    /**
     * Handles the createBuildShopPanel routine and encapsulates its core gameplay logic.
     * Parameters: width, height.
     * Returns: value defined by the surrounding game flow.
     */
    createBuildShopPanel(width, height) {
        const panelWidth = width * 0.46;
        const panelHeight = 280;
        const panelX = width * 0.78;
        const panelY = height - panelHeight / 2 - 12;

        this.shopPanel = this.scene.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0b1220, 0.8);
        this.shopPanel.setStrokeStyle(2, 0x0ea5e9, 0.6);
        this.shopPanel.setDepth(4);

        this.scene.add.text(panelX - panelWidth / 2 + 12, panelY - panelHeight / 2 + 8, 'Supply Drop Shop', {
            fontFamily: 'Orbitron',
            fontSize: '13px',
            color: '#8bffff'
        }).setOrigin(0, 0);

        this.creditsText = this.scene.add.text(panelX + panelWidth / 2 - 12, panelY - panelHeight / 2 + 10, 'Credits: --', {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#fef08a'
        }).setOrigin(1, 0);

        // Supply Drop Options
        const dropY = panelY - 70;
        this.scene.add.text(panelX - panelWidth / 2 + 12, dropY - 18, 'Purchase Encryption Keys', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0, 0.5);

        const inventory = window.metaProgression?.getShopInventory?.() || [];
        this.dropButtons = inventory.map((drop, idx) => {
            const y = dropY + idx * 50;
            return this.createSupplyDropButton(panelX, y, drop, panelWidth);
        });

        // Pending Items Section
        const pendingY = panelY + 40;
        this.scene.add.text(panelX - panelWidth / 2 + 12, pendingY - 22, 'Queued for Next Mission', {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#9fb8d1'
        }).setOrigin(0, 0.5);

        this.pendingItemsContainer = this.scene.add.container(panelX, pendingY);
        this.pendingItemsContainer.setDepth(5);

        // History hint
        this.scene.add.text(panelX, panelY + panelHeight / 2 - 10, '💡 Items are single-use consumables', {
            fontFamily: 'Orbitron',
            fontSize: '9px',
            color: '#64748b',
            align: 'center'
        }).setOrigin(0.5);
    }

    /**
     * Handles the createSupplyDropButton routine and encapsulates its core gameplay logic.
     * Parameters: x, y, drop, panelWidth.
     * Returns: value defined by the surrounding game flow.
     */
    createSupplyDropButton(x, y, drop, panelWidth) {
        const rowWidth = panelWidth - 24;
        
        const bg = this.scene.add.rectangle(x, y, rowWidth, 42, 0x0f172a, 0.9);
        bg.setStrokeStyle(2, drop.id === 'elite' ? 0xa855f7 : 0x22d3ee, 0.6);
        bg.setDepth(5);

        const name = this.scene.add.text(x - rowWidth / 2 + 10, y - 8, drop.name, {
            fontFamily: 'Orbitron',
            fontSize: '11px',
            color: '#dceefb'
        });
        name.setOrigin(0, 0.5);
        name.setDepth(6);

        const desc = this.scene.add.text(x - rowWidth / 2 + 10, y + 8, drop.description, {
            fontFamily: 'Orbitron',
            fontSize: '9px',
            color: '#94a3b8'
        });
        desc.setOrigin(0, 0.5);
        desc.setDepth(6);

        const button = this.scene.add.text(x + rowWidth / 2 - 10, y, `${drop.cost}`, {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#fef08a',
            backgroundColor: '#1e293b',
            padding: { x: 12, y: 6 }
        });
        button.setOrigin(1, 0.5);
        button.setDepth(6);
        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            this.scene.tweens.add({ targets: bg, alpha: 1, duration: 120 });
        });
        button.on('pointerout', () => {
            this.scene.tweens.add({ targets: bg, alpha: 0.9, duration: 120 });
        });
        button.on('pointerdown', () => this.purchaseDrop(drop.id));

        return { id: drop.id, bg, name, desc, button };
    }

    /**
     * Handles the createMissionButton routine and encapsulates its core gameplay logic.
     * Parameters: x, y, label, strokeColor, handler.
     * Returns: value defined by the surrounding game flow.
     */
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

    /**
     * Handles the updateModeButtonStyles routine and encapsulates its core gameplay logic.
     * Parameters: selectedMode.
     * Returns: value defined by the surrounding game flow.
     */
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

    /**
     * Handles the setModeButtonsEnabled routine and encapsulates its core gameplay logic.
     * Parameters: enabled.
     * Returns: value defined by the surrounding game flow.
     */
    setModeButtonsEnabled(enabled) {
        if (!this.modeButtonRefs) return;
        this.modeButtonRefs.forEach(({ rect, text }) => {
            rect.disableInteractive();
            if (enabled) {
                rect.setInteractive({ useHandCursor: true });
                rect.setAlpha(1);
                text.setAlpha(1);
            } else {
                rect.setAlpha(0.4);
                text.setAlpha(0.4);
            }
        });
    }

    /**
     * Handles the updateDetail routine and encapsulates its core gameplay logic.
     * Parameters: title, body.
     * Returns: value defined by the surrounding game flow.
     */
    updateDetail(title, body) {
        if (this.detailTitle) this.detailTitle.setText(title);
        if (this.detailBody) this.detailBody.setText(body);
    }

    /**
     * Handles the refreshNodeStatusText routine and encapsulates its core gameplay logic.
     * Parameters: mapNodes, selectedDistrict.
     * Returns: value defined by the surrounding game flow.
     */
    refreshNodeStatusText(mapNodes, selectedDistrict) {
        if (!this.nodeStatusText) return;
        const lines = mapNodes.map(node => {
            const statusLabel = node.state.status === 'occupied'
                ? 'OCCUPIED'
                : node.state.status === 'critical'
                    ? `CRITICAL ${this.scene.formatTimer(node.state.criticalTimer || 0)}`
                    : node.state.status === 'friendly'
                        ? 'FRIENDLY'
                        : node.state.timer > 0
                            ? `T-${this.scene.formatTimer(node.state.timer)}`
                            : 'THREATENED';
            const prosperityTag = node.state.prosperityMultiplier
                ? ` · P x${node.state.prosperityMultiplier.toFixed(2)}`
                : '';
            const lossTag = node.state.prosperityLossTimer > 0 && node.state.lastProsperityLoss
                ? ` · LOSS -${node.state.lastProsperityLoss}`
                : '';
            return `${node.config.label}: ${statusLabel}${prosperityTag}${lossTag}`;
        });
        const district = selectedDistrict ? `${selectedDistrict.config.name}: ${selectedDistrict.state.status.toUpperCase()}` : 'No district selected';
        this.nodeStatusText.setText([
            'Unified Map Status',
            district,
            ...lines
        ].join('\n'));
    }

    /**
     * Handles the updateMissionUi routine and encapsulates its core gameplay logic.
     * Parameters: mission, selectedMode, selectedDistrict, mapNodes.
     * Returns: value defined by the surrounding game flow.
     */
    updateMissionUi(mission, selectedMode, selectedDistrict, mapNodes) {
        if (!mission || !this.panelSummary) return;

        const assaultLocked = selectedDistrict?.state?.status === 'occupied';
        const modeToUse = assaultLocked ? 'assault' : (mission.mode || selectedMode);
        const { city, latitude, longitude, seed, directives } = mission;
        const mode = assaultLocked ? 'assault' : (mission.mode || selectedMode);
        const modeLabel = mode === 'survival' ? 'Survival' : mode === 'assault' ? 'Assault' : 'Defense';
        const directiveLabel = directives?.urgency ? `${directives.urgency.toUpperCase()} THREAT` : 'Threat mix pending';
        const clutchTag = directives?.clutchDefenseBonus ? ` · CLUTCH +${Math.round(directives.clutchDefenseBonus * 100)}%` : '';
        const prosperityTag = directives?.prosperityMultiplier ? ` · PROSPERITY x${directives.prosperityMultiplier.toFixed(2)}` : '';
        const rewardLabel = directives?.rewardMultiplier
            ? `${directives.rewardMultiplier.toFixed(2)}x rewards · ${directives.reward}${clutchTag}${prosperityTag}`
            : 'Standard rewards';
        const launchLabel = mode === 'survival'
            ? 'Launch Survival Run (Space)'
            : mode === 'assault'
                ? 'Launch Assault Run (Space)'
                : 'Launch Defense Run (Space)';

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
        this.setModeButtonsEnabled(!assaultLocked);
        this.updateModeButtonStyles(modeToUse);
    }

    /**
     * Handles the updateExternalLaunchButton routine and encapsulates its core gameplay logic.
     * Parameters: selectedDistrict, mission, selectedMode.
     * Returns: value defined by the surrounding game flow.
     */
    updateExternalLaunchButton(selectedDistrict, mission, selectedMode) {
        const btn = document.getElementById('build-launch');
        if (!btn) return;
        const hasSelection = !!selectedDistrict;
        const assaultLocked = selectedDistrict?.state?.status === 'occupied';
        const mode = assaultLocked ? 'assault' : (mission?.mode || selectedMode);
        const labelMode = mode === 'survival' ? 'Survival' : mode === 'assault' ? 'Assault' : 'Defense';
        const districtName = selectedDistrict?.config?.name || 'mission';
        btn.disabled = !hasSelection;
        btn.textContent = hasSelection
            ? `Launch ${labelMode} Run — ${districtName}`
            : 'Select a district to launch';
        btn.classList.toggle('opacity-50', !hasSelection);
        btn.classList.toggle('cursor-not-allowed', !hasSelection);
    }

    /**
     * Handles the refreshBuildShopPanel routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    refreshBuildShopPanel() {
        if (!this.shopPanel) return;
        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        const inventory = window.metaProgression?.getShopInventory?.() || [];
        const pending = window.metaProgression?.getPendingDrop?.();

        // Update credits
        if (this.creditsText) {
            this.creditsText.setText(`Credits: ${meta.credits}`);
        }

        // Update drop buttons
        this.dropButtons.forEach(btn => {
            const drop = inventory.find(d => d.id === btn.id);
            if (!drop) return;
            
            const affordable = drop.affordable;
            btn.button.setAlpha(affordable ? 1 : 0.5);
            btn.bg.setAlpha(affordable ? 0.9 : 0.6);
            
            if (!affordable) {
                btn.button.disableInteractive();
            } else if (!btn.button.input?.enabled) {
                btn.button.setInteractive({ useHandCursor: true });
            }
        });

        // Update pending items
        this.renderPendingItems(pending);
    }

    /**
     * Handles the renderPendingItems routine and encapsulates its core gameplay logic.
     * Parameters: pending.
     * Returns: value defined by the surrounding game flow.
     */
    renderPendingItems(pending) {
        if (!this.pendingItemsContainer) return;
        this.pendingItemsContainer.removeAll(true);

        if (!pending || !pending.items || pending.items.length === 0) {
            const emptyText = this.scene.add.text(0, 0, 'No items queued\nPurchase a drop above', {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: '#64748b',
                align: 'center'
            });
            emptyText.setOrigin(0.5);
            this.pendingItemsContainer.add(emptyText);
            return;
        }

        pending.items.forEach((item, idx) => {
            const y = idx * 20 - (pending.items.length - 1) * 10;
            
            const itemText = this.scene.add.text(-140, y, `• ${item.name}`, {
                fontFamily: 'Orbitron',
                fontSize: '10px',
                color: '#dceefb'
            });
            itemText.setOrigin(0, 0.5);

            const tierColor = this.getTierColor(item.tier);
            const badge = this.scene.add.text(140, y, this.getTierLabel(item.tier), {
                fontFamily: 'Orbitron',
                fontSize: '8px',
                color: tierColor
            });
            badge.setOrigin(1, 0.5);

            this.pendingItemsContainer.add([itemText, badge]);
        });
    }

    /**
     * Handles the getTierColor routine and encapsulates its core gameplay logic.
     * Parameters: tier.
     * Returns: value defined by the surrounding game flow.
     */
    getTierColor(tier) {
        return tier === 'tier3' ? '#a855f7' : tier === 'tier2' ? '#22d3ee' : '#94a3b8';
    }

    /**
     * Handles the getTierLabel routine and encapsulates its core gameplay logic.
     * Parameters: tier.
     * Returns: value defined by the surrounding game flow.
     */
    getTierLabel(tier) {
        return tier === 'tier3' ? 'RARE' : tier === 'tier2' ? 'COMBAT' : 'UTIL';
    }

    /**
     * Handles the highlightShopPanel routine and encapsulates its core gameplay logic.
     * Parameters: none.
     * Returns: value defined by the surrounding game flow.
     */
    highlightShopPanel() {
        if (!this.shopPanel) return;
        this.scene.tweens.add({
            targets: this.shopPanel,
            scale: { from: 1, to: 1.02 },
            alpha: { from: 0.8, to: 1 },
            duration: 180,
            yoyo: true
        });
    }

    /**
     * Handles the purchaseDrop routine and encapsulates its core gameplay logic.
     * Parameters: dropId.
     * Returns: value defined by the surrounding game flow.
     */
    purchaseDrop(dropId) {
        if (!window.metaProgression?.purchaseSupplyDrop) return;
        
        const result = window.metaProgression.purchaseSupplyDrop(dropId);
        
        if (result.success) {
            // Trigger unboxing sequence
            if (window.SupplyDropUnboxing && this.scene) {
                window.SupplyDropUnboxing.setScene(this.scene);
                window.SupplyDropUnboxing.playUnboxingSequence(result, () => {
                    this.refreshBuildShopPanel();
                    this.highlightShopPanel();
                });
            } else {
                this.refreshBuildShopPanel();
                this.highlightShopPanel();
            }
        } else if (result.reason === 'insufficient_funds') {
            // Flash credits
            if (this.creditsText) {
                this.scene.tweens.add({
                    targets: this.creditsText,
                    scale: { from: 1, to: 1.15 },
                    duration: 140,
                    yoyo: true
                });
            }
        }
    }
}
