// ------------------------
// file js/ui/uiRadar.js Radar rendering
// ------------------------

function updateRadar(scene) {
    if (!radarCtx || !scene) return;
    const { enemies, garrisonDefenders, operatives, humans, bosses } = scene;
    const player = getActivePlayer(scene);
    if (!player) return;

    const width = radarCanvas.width;
    const height = radarCanvas.height;

    radarCtx.fillStyle = '#001111';
    radarCtx.fillRect(0, 0, width, height);

    const scaleX = width / CONFIG.worldWidth;

    radarCtx.strokeStyle = '#443322';
    radarCtx.lineWidth = 2;
    radarCtx.beginPath();
    radarCtx.moveTo(0, height - 5);
    radarCtx.lineTo(width, height - 5);
    radarCtx.stroke();

    const cam = scene.cameras.main;
    let viewX = cam.scrollX * scaleX;
    const viewW = cam.width * scaleX;

    radarCtx.strokeStyle = '#006666';
    radarCtx.lineWidth = 1.5;
    radarCtx.strokeRect(viewX, 1, viewW, height - 2);

    if (viewX < 0) {
        radarCtx.strokeRect(viewX + width, 1, viewW, height - 2);
    } else if (viewX + viewW > width) {
        radarCtx.strokeRect(viewX - width, 1, viewW, height - 2);
    }

    if (enemies) {
        enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            const ex = enemy.x * scaleX;
            const ey = (enemy.y / CONFIG.worldHeight) * height;

            let color = '#ff0000';
            switch (enemy.enemyType) {
                case 'lander': color = '#ff4444'; break;
                case 'mutant': color = '#ff8800'; break;
                case 'drone': color = '#ff44ff'; break;
                case 'bomber': color = '#ff0000'; break;
                case 'pod': color = '#aa00ff'; break;
                case 'swarmer': color = '#00ff00'; break;
                case 'baiter': color = '#00ffff'; break;
                case 'kamikaze': color = '#ff2200'; break;
                case 'turret': color = '#aaaaaa'; break;
                case 'shield': color = '#0088ff'; break;
                case 'seeker': color = '#9900ff'; break;
                case 'spawner': color = '#ffff00'; break;
                case 'shielder': color = '#00ff88'; break;
                case 'bouncer': color = '#ff6600'; break;
                case 'sniper': color = '#ffffff'; break;
                case 'swarmLeader': color = '#4400cc'; break;
                case 'regenerator': color = '#00aaaa'; break;
            }

            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            const size = (enemy.enemyType === 'shield' || enemy.enemyType === 'spawner' || enemy.enemyType === 'turret') ? 3.5 : 2;
            radarCtx.arc(ex, ey, size, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    if (garrisonDefenders) {
        garrisonDefenders.children.entries.forEach(defender => {
            if (!defender.active) return;
            const dx = defender.x * scaleX;
            const dy = (defender.y / CONFIG.worldHeight) * height;
            let color = '#ffbb44';
            switch (defender.garrisonType) {
                case 'rifle': color = '#f97316'; break;
                case 'shield': color = '#38bdf8'; break;
                case 'heavy': color = '#fb7185'; break;
                case 'sniper': color = '#e2e8f0'; break;
                case 'medic': color = '#7dd3fc'; break;
                case 'engineer': color = '#f59e0b'; break;
                case 'jetpack': color = '#60a5fa'; break;
                case 'drone': color = '#22d3ee'; break;
                case 'walker': color = '#94a3b8'; break;
                case 'hound': color = '#fb923c'; break;
            }
            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            radarCtx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    if (operatives) {
        operatives.children.entries.forEach(operative => {
            if (!operative.active) return;
            const ox = operative.x * scaleX;
            const oy = (operative.y / CONFIG.worldHeight) * height;
            let color = '#60a5fa';
            switch (operative.operativeType) {
                case 'infantry': color = '#38bdf8'; break;
                case 'heavy': color = '#f97316'; break;
                case 'medic': color = '#7dd3fc'; break;
                case 'saboteur': color = '#22d3ee'; break;
            }
            radarCtx.fillStyle = color;
            radarCtx.beginPath();
            radarCtx.arc(ox, oy, 2.5, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    if (humans) {
        radarCtx.fillStyle = '#ffaa00';
        humans.children.entries.forEach(human => {
            if (!human.active) return;
            const hx = human.x * scaleX;
            const hy = (human.y / CONFIG.worldHeight) * height;
            radarCtx.beginPath();
            radarCtx.arc(hx, hy, 2, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    if (bosses) {
        bosses.children.entries.forEach(boss => {
            if (!boss.active) return;
            const bx = boss.x * scaleX;
            const by = (boss.y / CONFIG.worldHeight) * height;
            radarCtx.fillStyle = '#ff66cc';
            radarCtx.beginPath();
            radarCtx.arc(bx, by, 4, 0, Math.PI * 2);
            radarCtx.fill();
        });
    }

    if (player && player.active) {
        const px = player.x * scaleX;
        const py = (player.y / CONFIG.worldHeight) * height;
        radarCtx.fillStyle = '#ffffff';
        radarCtx.fillRect(px - 2, py - 2, 4, 4);
    }
}
