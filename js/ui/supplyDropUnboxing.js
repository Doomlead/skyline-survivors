// ------------------------
// Supply Drop Unboxing Cinematic Sequence
// The "Dopamine Hook"
// ------------------------

const SupplyDropUnboxing = (function() {
    let scene = null;
    let isPlaying = false;

    function setScene(phaserScene) {
        scene = phaserScene;
    }

    function playUnboxingSequence(lootResult, onComplete) {
        if (isPlaying || !scene) {
            if (onComplete) onComplete();
            return;
        }

        isPlaying = true;
        const { items, dropType } = lootResult;

        // Determine highest tier for visual effects
        const highestTier = items.reduce((max, item) => {
            const tierNum = item.tier === 'tier3' ? 3 : item.tier === 'tier2' ? 2 : 1;
            return Math.max(max, tierNum);
        }, 1);

        const isElite = dropType === 'elite';
        const isJackpot = highestTier === 3;

        // Create overlay
        const overlay = scene.add.rectangle(
            scene.scale.width / 2,
            scene.scale.height / 2,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0
        );
        overlay.setDepth(1000);

        // Fade to black
        scene.tweens.add({
            targets: overlay,
            alpha: 0.95,
            duration: 500,
            onComplete: () => {
                showSatelliteSequence(overlay, items, isElite, isJackpot, onComplete);
            }
        });
    }

    function showSatelliteSequence(overlay, items, isElite, isJackpot, onComplete) {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        // Create satellite sprite or placeholder
        const satellite = scene.add.rectangle(centerX, centerY - 150, 120, 80, 0x1e3a8a, 1);
        satellite.setDepth(1001);
        satellite.setStrokeStyle(3, 0x3b82f6);

        const satText = scene.add.text(centerX, centerY - 150, 'ORBITAL\nSATELLITE', {
            fontFamily: 'Orbitron',
            fontSize: '12px',
            color: '#60a5fa',
            align: 'center'
        });
        satText.setOrigin(0.5);
        satText.setDepth(1002);

        // Rotation animation
        scene.tweens.add({
            targets: satellite,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Energy charge build-up
        const chargeColor = isJackpot ? 0xfbbf24 : isElite ? 0xa855f7 : 0x3b82f6;
        const energyGlow = scene.add.circle(centerX, centerY - 150, 10, chargeColor, 0);
        energyGlow.setDepth(1001);

        // Audio: Rising whine (simulate with visual feedback if no audio)
        const chargeText = scene.add.text(centerX, centerY - 50, 'CHARGING...', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            color: '#8b5cf6'
        });
        chargeText.setOrigin(0.5);
        chargeText.setDepth(1002);
        chargeText.setAlpha(0);

        scene.tweens.add({
            targets: chargeText,
            alpha: 1,
            duration: 300
        });

        // Glow expansion (anticipation)
        scene.tweens.add({
            targets: energyGlow,
            radius: 60,
            alpha: 0.8,
            duration: 2000,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                firePod(overlay, satellite, satText, energyGlow, chargeText, items, isJackpot, onComplete);
            }
        });
    }

    function firePod(overlay, satellite, satText, energyGlow, chargeText, items, isJackpot, onComplete) {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        // Flash and fire
        energyGlow.setAlpha(0);
        chargeText.setText('FIRING!');
        
        scene.tweens.add({
            targets: chargeText,
            scale: 1.3,
            alpha: 0,
            duration: 400
        });

        // Create pod
        const pod = scene.add.rectangle(centerX, centerY - 150, 60, 80, 0x475569, 1);
        pod.setDepth(1001);
        pod.setStrokeStyle(2, 0x94a3b8);

        // Pod drops down
        scene.tweens.add({
            targets: pod,
            y: centerY + 100,
            duration: 800,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                impactSequence(overlay, satellite, satText, pod, items, isJackpot, onComplete);
            }
        });

        // Clean up satellite
        scene.tweens.add({
            targets: [satellite, satText],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                satellite.destroy();
                satText.destroy();
            }
        });
    }

    function impactSequence(overlay, satellite, satText, pod, items, isJackpot, onComplete) {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        // Screen shake
        scene.cameras.main.shake(300, 0.01);

        // Impact flash
        const flash = scene.add.rectangle(centerX, centerY, scene.scale.width, scene.scale.height, 0xffffff, 0);
        flash.setDepth(1003);
        
        scene.tweens.add({
            targets: flash,
            alpha: isJackpot ? 0.7 : 0.4,
            duration: 100,
            yoyo: true,
            onComplete: () => flash.destroy()
        });

        // Pod impact particles
        for (let i = 0; i < 12; i++) {
            const particle = scene.add.circle(
                centerX + (Math.random() - 0.5) * 40,
                centerY + 100,
                4,
                0x94a3b8
            );
            particle.setDepth(1002);
            
            scene.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 200,
                y: particle.y + Math.random() * 100,
                alpha: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }

        // Pod opens
        setTimeout(() => {
            revealItems(overlay, pod, items, isJackpot, onComplete);
        }, 400);
    }

    function revealItems(overlay, pod, items, isJackpot, onComplete) {
        const centerX = scene.scale.width / 2;
        const centerY = scene.scale.height / 2;

        // Pod explodes open
        pod.destroy();

        // God rays effect
        if (isJackpot) {
            for (let i = 0; i < 8; i++) {
                const ray = scene.add.rectangle(
                    centerX,
                    centerY + 100,
                    4,
                    200,
                    0xfbbf24,
                    0.3
                );
                ray.setDepth(1001);
                ray.setAngle(i * 45);
                
                scene.tweens.add({
                    targets: ray,
                    scaleY: 3,
                    alpha: 0,
                    duration: 1200,
                    onComplete: () => ray.destroy()
                });
            }

            // Confetti
            for (let i = 0; i < 30; i++) {
                const confetti = scene.add.circle(
                    centerX + (Math.random() - 0.5) * 100,
                    centerY + 100,
                    3,
                    Phaser.Display.Color.RandomRGB().color
                );
                confetti.setDepth(1002);
                
                scene.tweens.add({
                    targets: confetti,
                    y: confetti.y + 200 + Math.random() * 100,
                    x: confetti.x + (Math.random() - 0.5) * 200,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => confetti.destroy()
                });
            }
        }

        // Display items
        const itemContainer = scene.add.container(centerX, centerY);
        itemContainer.setDepth(1003);

        const title = scene.add.text(0, -100, 'SUPPLY DROP ACQUIRED', {
            fontFamily: 'Orbitron',
            fontSize: '20px',
            color: isJackpot ? '#fbbf24' : '#22d3ee',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setAlpha(0);
        itemContainer.add(title);

        scene.tweens.add({
            targets: title,
            alpha: 1,
            y: -120,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Item cards
        const spacing = 140;
        const startX = -(items.length - 1) * spacing / 2;

        items.forEach((item, idx) => {
            const x = startX + idx * spacing;
            
            const card = scene.add.rectangle(x, 20, 120, 140, 0x0f172a, 0.9);
            card.setStrokeStyle(3, getTierColorHex(item.tier), 0.9);
            card.setAlpha(0);
            card.setScale(0.5);
            
            const icon = scene.add.text(x, 0, '⬢', {
                fontSize: '40px',
                color: getTierColorString(item.tier)
            });
            icon.setOrigin(0.5);
            icon.setAlpha(0);
            
            const itemName = scene.add.text(x, 50, item.name, {
                fontFamily: 'Orbitron',
                fontSize: '11px',
                color: '#dceefb',
                align: 'center',
                wordWrap: { width: 110 }
            });
            itemName.setOrigin(0.5);
            itemName.setAlpha(0);

            const tierLabel = scene.add.text(x, 75, getTierLabel(item.tier), {
                fontFamily: 'Orbitron',
                fontSize: '9px',
                color: getTierColorString(item.tier)
            });
            tierLabel.setOrigin(0.5);
            tierLabel.setAlpha(0);

            itemContainer.add([card, icon, itemName, tierLabel]);

            // Stagger animation
            scene.time.delayedCall(idx * 200, () => {
                scene.tweens.add({
                    targets: [card, icon, itemName, tierLabel],
                    alpha: 1,
                    duration: 400
                });
                
                scene.tweens.add({
                    targets: card,
                    scale: 1,
                    duration: 400,
                    ease: 'Back.easeOut'
                });

                // Audio: Chime sound would play here
            });
        });

        // Continue button
        const continueBtn = scene.add.text(0, 180, 'CONTINUE', {
            fontFamily: 'Orbitron',
            fontSize: '14px',
            color: '#22d3ee',
            backgroundColor: '#0f172a',
            padding: { x: 20, y: 10 }
        });
        continueBtn.setOrigin(0.5);
        continueBtn.setAlpha(0);
        continueBtn.setInteractive({ useHandCursor: true });
        continueBtn.on('pointerdown', () => {
            closeUnboxing(overlay, itemContainer, onComplete);
        });

        itemContainer.add(continueBtn);

        scene.tweens.add({
            targets: continueBtn,
            alpha: 1,
            duration: 400,
            delay: items.length * 200 + 400
        });
    }

    function closeUnboxing(overlay, itemContainer, onComplete) {
        scene.tweens.add({
            targets: [overlay, itemContainer],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                overlay.destroy();
                itemContainer.destroy();
                isPlaying = false;
                if (onComplete) onComplete();
            }
        });
    }

    function getTierColorHex(tier) {
        return tier === 'tier3' ? 0xa855f7 : tier === 'tier2' ? 0x22d3ee : 0x94a3b8;
    }

    function getTierColorString(tier) {
        return tier === 'tier3' ? '#a855f7' : tier === 'tier2' ? '#22d3ee' : '#94a3b8';
    }

    function getTierLabel(tier) {
        return tier === 'tier3' ? 'RARE' : tier === 'tier2' ? 'COMBAT' : 'UTILITY';
    }

    return {
        setScene,
        playUnboxingSequence
    };
})();

window.SupplyDropUnboxing = SupplyDropUnboxing;