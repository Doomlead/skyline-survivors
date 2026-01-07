// ------------------------
// File: js/ui/districtShop.js
// ------------------------

const DistrictShop = (function() {
    let elements = null;
    let initialized = false;

    function cacheElements() {
        elements = {
            panel: document.getElementById('district-shop-panel'),
            offense: document.getElementById('district-shop-loadouts-offense'),
            defense: document.getElementById('district-shop-loadouts-defense'),
            items: document.getElementById('district-shop-items')
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
        renderLoadouts('offense');
        renderLoadouts('defense');
        renderShopItems();
    }

    function renderLoadouts(slot) {
        const container = elements[slot];
        if (!container) return;
        container.innerHTML = '';

        const options = window.metaProgression?.getLoadoutOptions?.()?.[slot] || [];
        if (!options.length) {
            container.appendChild(buildEmptyRow('No loadouts available yet.'));
            return;
        }

        options.forEach(option => {
            const row = document.createElement('div');
            row.className = 'district-shop-row';

            const meta = document.createElement('div');
            meta.className = 'district-shop-meta';

            const title = document.createElement('div');
            title.className = 'district-shop-title';
            title.textContent = option.name;

            const desc = document.createElement('div');
            desc.className = 'district-shop-desc';
            const lockedSuffix = option.unlocked ? '' : ' (Unlock via shop)';
            desc.textContent = `${option.description || 'Loadout modifier.'}${lockedSuffix}`;

            meta.appendChild(title);
            meta.appendChild(desc);

            const button = document.createElement('button');
            button.className = 'district-shop-button';
            if (!option.unlocked) {
                button.textContent = 'Locked';
                button.disabled = true;
            } else if (option.equipped) {
                button.textContent = 'Equipped';
                button.disabled = true;
            } else {
                button.textContent = 'Equip';
                button.addEventListener('click', () => {
                    const changed = window.metaProgression?.setEquippedLoadout?.(slot, option.id);
                    if (changed) {
                        refresh();
                        window.DistrictLayoutManager?.updateDistrictPanels?.();
                    }
                });
            }

            row.appendChild(meta);
            row.appendChild(button);
            container.appendChild(row);
        });
    }

    function renderShopItems() {
        const container = elements.items;
        if (!container) return;
        container.innerHTML = '';

        const meta = window.metaProgression?.getMetaState?.() || { credits: 0 };
        const inventory = window.metaProgression?.getShopInventory?.() || [];
        if (!inventory.length) {
            container.appendChild(buildEmptyRow('No shop unlocks available yet.'));
            return;
        }

        inventory.forEach(item => {
            const row = document.createElement('div');
            row.className = 'district-shop-row';

            const metaCol = document.createElement('div');
            metaCol.className = 'district-shop-meta';

            const title = document.createElement('div');
            title.className = 'district-shop-title';
            title.textContent = item.name;

            const desc = document.createElement('div');
            desc.className = 'district-shop-desc';
            desc.textContent = item.description || 'Unlocks new mission-start powerups.';

            metaCol.appendChild(title);
            metaCol.appendChild(desc);

            const button = document.createElement('button');
            button.className = 'district-shop-button';

            if (item.owned) {
                button.textContent = 'Owned';
                button.disabled = true;
            } else if (!item.affordable) {
                const shortfall = Math.max(0, item.cost - (meta.credits || 0));
                button.textContent = `Need ${shortfall}`;
                button.disabled = true;
            } else {
                button.textContent = `Buy ${item.cost}`;
                button.addEventListener('click', () => {
                    const result = window.metaProgression?.purchaseShopItem?.(item.id);
                    if (result?.success) {
                        refresh();
                        window.DistrictLayoutManager?.updateDistrictPanels?.();
                    }
                });
            }

            row.appendChild(metaCol);
            row.appendChild(button);
            container.appendChild(row);
        });
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
