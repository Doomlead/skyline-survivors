(function () {
    const overlay = {
        canvas: null,
        ctx: null,
        initialized: false,
        resize() {
            if (!this.canvas) return;
            const parent = this.canvas.parentElement;
            if (!parent) return;
            const { clientWidth, clientHeight } = parent;
            if (this.canvas.width !== clientWidth || this.canvas.height !== clientHeight) {
                this.canvas.width = clientWidth;
                this.canvas.height = clientHeight;
            }
        },
        init() {
            if (this.initialized) return true;
            this.canvas = document.getElementById('build-underlay');
            if (!this.canvas) return false;
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) return false;
            this.canvas.classList.remove('hidden');
            this.resize();
            this.initialized = true;
            return true;
        },
        hide() {
            if (!this.canvas) return;
            this.canvas.classList.add('hidden');
            this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.initialized = false;
        },
        render(layout) {
            if (!this.init()) return;
            this.resize();
            const ctx = this.ctx;
            const { width, height } = this.canvas;
            ctx.clearRect(0, 0, width, height);

            const topHeight = 60;
            const sideWidth = Math.min(320, width * 0.28);
            const gutter = 16;
            const centerPanel = {
                x: sideWidth + gutter * 1.5,
                y: topHeight + gutter,
                w: Math.max(360, width - sideWidth - gutter * 3),
                h: Math.max(260, height - topHeight - gutter * 2)
            };

            drawPanel(ctx, 0, 0, width, topHeight, '#0b1220', '#33c0ff', { fillAlpha: 0.85 });
            drawPanel(ctx, gutter, topHeight + gutter, sideWidth - gutter, (height - topHeight - gutter * 3) * 0.55, '#0c1e34', '#33c0ff', { fillAlpha: 0.85 });
            drawPanel(ctx, gutter, height - (height - topHeight - gutter * 3) * 0.4, sideWidth - gutter, (height - topHeight - gutter * 3) * 0.4, '#0c1e34', '#22d3ee', { fillAlpha: 0.85 });
            // Center panel outline only to avoid obscuring the globe
            drawPanel(ctx, centerPanel.x, centerPanel.y, centerPanel.w, centerPanel.h, '#050912', '#0ea5e9', { fillAlpha: 0, strokeAlpha: 0.75 });

            ctx.fillStyle = '#c7e3ff';
            ctx.font = '16px Orbitron';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(layout?.title || 'Select a district', width / 2, topHeight / 2);

            ctx.textAlign = 'left';
            ctx.font = '13px Orbitron';
            ctx.fillStyle = '#dceefb';
            wrapText(ctx, layout?.missionTitle || 'Mission & Build Routing', gutter * 1.4, topHeight + gutter * 1.8, sideWidth - gutter * 2.2, 18);
            ctx.font = '11px Orbitron';
            ctx.fillStyle = '#9fb8d1';
            wrapText(ctx, layout?.missionBody || 'Choose a district to see routing details.', gutter * 1.4, topHeight + gutter * 3.2, sideWidth - gutter * 2.2, 16);

            const shipY = height - (height - topHeight - gutter * 3) * 0.4 + gutter * 1.2;
            ctx.font = '13px Orbitron';
            ctx.fillStyle = '#dceefb';
            wrapText(ctx, layout?.shipTitle || 'Ship Status', gutter * 1.4, shipY, sideWidth - gutter * 2.2, 18);
            ctx.font = '11px Orbitron';
            ctx.fillStyle = '#9fb8d1';
            wrapText(ctx, layout?.shipBody || 'Loadouts, bombs, and hull integrity appear here.', gutter * 1.4, shipY + 22, sideWidth - gutter * 2.2, 16);

            ctx.textAlign = 'center';
            ctx.fillStyle = '#8bffff';
            ctx.font = '15px Orbitron';
            ctx.fillText(layout?.centerTitle || 'District Globe', centerPanel.x + centerPanel.w / 2, centerPanel.y + 24);
        }
    };

    function drawPanel(ctx, x, y, w, h, fill, stroke, opts = {}) {
        const { fillAlpha = 1, strokeAlpha = 1, strokeWidth = 2 } = opts;
        ctx.save();
        if (fillAlpha > 0) {
            ctx.globalAlpha = fillAlpha;
            ctx.fillStyle = fill;
            roundRect(ctx, x, y, w, h, 12, true, false);
        }
        if (strokeAlpha > 0 && strokeWidth > 0) {
            ctx.globalAlpha = strokeAlpha;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 10, false, true);
        }
        ctx.restore();
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        if (!text) return;
        const words = text.split(/\s+/);
        let line = '';
        let cursorY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line.trim(), x, cursorY);
                line = words[n] + ' ';
                cursorY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), x, cursorY);
    }

    window.buildOverlay = overlay;
})();
