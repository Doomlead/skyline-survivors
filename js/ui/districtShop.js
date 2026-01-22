// ------------------------
// File: js/ui/districtShop.js
// Supply Drop Gacha Shop UI
// ------------------------

const DistrictShop = (function() {
    let elements = null;
    let initialized = false;

    function cacheElements() {
        elements = {
            panel: document.getElementById('district-shop-panel'),
            dropOptions: document.getElementById('district-shop-drops'),
            pendingItems: document.getElementById('district-shop-pending'),
            historyPanel: document.getElementById('district-shop-history')
        };
        return elements;
    }

    function init() {
        if (initialized) return;
        cacheElements();
        if (!elements.panel) return;
        initialized = true;
        refresh();
    }

    function refresh() {
        if (!initialized) {
            init();
            if (!initialized) return;
        }
        renderSupplyDrops();
        renderPendingDrop();
        renderLootHistory();
    }

    function renderSupplyDrops() {
        const container = elements.dropOptions;
        if (!container) return;
        container.innerHTML = '';

        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        const inventory = window.metaProgression?.getShopInventory?.() || [];

        if (!inventory.length) {
            container.appendChild(buildEmptyRow('No supply drops available.'));
            return;
        }

        inventory.forEach(drop => {
            const row = document.createElement('div');
            row.className = 'district-shop-row supply-drop-card';

            const metaCol = document.createElement('div');
            metaCol.className = 'district-shop-meta';

            const title = document.createElement('div');
            title.className = 'district-shop-title';
            title.textContent = drop.name;

            const desc = document.createElement('div');
            desc.className = 'district-shop-desc';
            desc.textContent = drop.description || 'Orbital supply drop.';

            const stats = document.createElement('div');
            stats.className = 'district-shop-stats';
            stats.textContent = `${drop.guaranteedItems} guaranteed • ${Math.round(drop.bonusChance * 100)}% bonus item`;
            stats.style.fontSize = '10px';
            stats.style.color = '#94a3b8';
            stats.style.marginTop = '4px';

            metaCol.appendChild(title);
            metaCol.appendChild(desc);
            metaCol.appendChild(stats);

            const button = document.createElement('button');
            button.className = 'district-shop-button supply-drop-button';

            if (!drop.affordable) {
                const shortfall = Math.max(0, drop.cost - (meta.credits || 0));
                button.textContent = `Need ${shortfall} more`;
                button.disabled = true;
            } else {
                button.textContent = `Purchase ${drop.cost}`;
                button.addEventListener('click', () => {
                    purchaseDrop(drop.id);
                });
            }

            row.appendChild(metaCol);
            row.appendChild(button);
            container.appendChild(row);
        });
    }

    function renderPendingDrop() {
        const container = elements.pendingItems;
        if (!container) return;
        container.innerHTML = '';

        const pending = window.metaProgression?.getPendingDrop?.();
        
        if (!pending || !pending.items || pending.items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'district-shop-desc';
            empty.textContent = 'No items queued. Purchase a Supply Drop to power up your next deployment.';
            empty.style.textAlign = 'center';
            empty.style.padding = '12px';
            empty.style.color = '#64748b';
            container.appendChild(empty);
            return;
        }

        const header = document.createElement('div');
        header.className = 'district-shop-title';
        header.textContent = `${pending.dropType === 'elite' ? 'Elite' : 'Standard'} Drop - Ready for Next Mission`;
        header.style.marginBottom = '8px';
        header.style.color = '#22d3ee';
        container.appendChild(header);

        pending.items.forEach((item, idx) => {
            const itemRow = document.createElement('div');
            itemRow.className = 'pending-item-row';
            itemRow.style.display = 'flex';
            itemRow.style.justifyContent = 'space-between';
            itemRow.style.padding = '6px 12px';
            itemRow.style.marginBottom = '4px';
            itemRow.style.backgroundColor = getTierColor(item.tier, 0.1);
            itemRow.style.border = `1px solid ${getTierColor(item.tier, 0.4)}`;
            itemRow.style.borderRadius = '4px';

            const nameText = document.createElement('span');
            nameText.textContent = item.name;
            nameText.style.color = '#dceefb';
            nameText.style.fontFamily = 'Orbitron';
            nameText.style.fontSize = '11px';

            const tierBadge = document.createElement('span');
            tierBadge.textContent = item.tier === 'tier3' ? 'RARE' : item.tier === 'tier2' ? 'COMBAT' : 'UTILITY';
            tierBadge.style.color = getTierColor(item.tier);
            tierBadge.style.fontFamily = 'Orbitron';
            tierBadge.style.fontSize = '9px';
            tierBadge.style.fontWeight = 'bold';

            itemRow.appendChild(nameText);
            itemRow.appendChild(tierBadge);
            container.appendChild(itemRow);
        });

        const warning = document.createElement('div');
        warning.className = 'district-shop-desc';
        warning.textContent = '⚠ Items will be consumed on next deployment';
        warning.style.marginTop = '8px';
        warning.style.fontSize = '10px';
        warning.style.color = '#fbbf24';
        warning.style.textAlign = 'center';
        container.appendChild(warning);
    }

    function renderLootHistory() {
        const container = elements.historyPanel;
        if (!container) return;
        container.innerHTML = '';

        const history = window.metaProgression?.getLootHistory?.() || [];

        if (history.length === 0) {
            container.appendChild(buildEmptyRow('No purchase history yet.'));
            return;
        }

        const title = document.createElement('div');
        title.className = 'district-shop-title';
        title.textContent = 'Recent Drops';
        title.style.marginBottom = '8px';
        container.appendChild(title);

        history.slice().reverse().forEach((entry, idx) => {
            const row = document.createElement('div');
            row.className = 'history-entry';
            row.style.padding = '6px 8px';
            row.style.marginBottom = '6px';
            row.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
            row.style.border = '1px solid rgba(29, 202, 255, 0.2)';
            row.style.borderRadius = '3px';

            const dropLabel = document.createElement('div');
            dropLabel.textContent = entry.dropType === 'elite' ? 'Elite Drop' : 'Standard Drop';
            dropLabel.style.fontFamily = 'Orbitron';
            dropLabel.style.fontSize = '10px';
            dropLabel.style.color = '#9fb8d1';
            dropLabel.style.marginBottom = '3px';

            const itemList = document.createElement('div');
            itemList.textContent = entry.items.join(', ');
            itemList.style.fontFamily = 'Orbitron';
            itemList.style.fontSize = '9px';
            itemList.style.color = '#64748b';

            row.appendChild(dropLabel);
            row.appendChild(itemList);
            container.appendChild(row);
        });
    }

    function getTierColor(tier, alpha = 1) {
        const colors = {
            tier1: `rgba(148, 163, 184, ${alpha})`, // Gray
            tier2: `rgba(34, 211, 238, ${alpha})`,  // Cyan
            tier3: `rgba(168, 85, 247, ${alpha})`   // Purple
        };
        return colors[tier] || colors.tier1;
    }

    function buildEmptyRow(message) {
        const row = document.createElement('div');
        row.className = 'district-shop-row';

        const metaCol = document.createElement('div');
        metaCol.className = 'district-shop-meta';

        const desc = document.createElement('div');
        desc.className = 'district-shop-desc';
        desc.textContent = message;

        metaCol.appendChild(desc);
        row.appendChild(metaCol);
        return row;
    }

    function purchaseDrop(dropType) {
        if (!window.metaProgression?.purchaseSupplyDrop) return;
        
        const result = window.metaProgression.purchaseSupplyDrop(dropType);
        
        if (result.success) {
            // Trigger unboxing sequence if available
            if (window.SupplyDropUnboxing) {
                window.SupplyDropUnboxing.playUnboxingSequence(result, () => {
                    refresh();
                    window.DistrictLayoutManager?.updateDistrictPanels?.();
                });
            } else {
                // Fallback: just refresh UI
                refresh();
                window.DistrictLayoutManager?.updateDistrictPanels?.();
            }
        } else if (result.reason === 'insufficient_funds') {
            // Flash credits indicator
            const creditsEl = document.querySelector('.credits-display');
            if (creditsEl) {
                creditsEl.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    creditsEl.style.animation = '';
                }, 300);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        refresh
    };
})();

window.DistrictShop = DistrictShop;