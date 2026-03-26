const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

function getJsFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getJsFiles(fullPath));
            return;
        }
        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    });

    return files;
}

function toRepoPath(absPath) {
    return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

test('district-game-container references are limited to layout/resize modules', () => {
    const allowList = new Set([
        'js/ui/gameLayoutManager.js',
        'js/core/gameBootstrap.js'
    ]);

    const violations = getJsFiles(path.join(repoRoot, 'js'))
        .map((file) => {
            const source = fs.readFileSync(file, 'utf8');
            return {
                file: toRepoPath(file),
                hasDistrictContainer: source.includes('district-game-container')
            };
        })
        .filter((entry) => entry.hasDistrictContainer && !allowList.has(entry.file))
        .map((entry) => entry.file);

    assert.deepStrictEqual(
        violations,
        [],
        `Unexpected district-game-container dependency found in: ${violations.join(', ')}`
    );
});

test('only layout/resize modules reference both game and district container IDs', () => {
    const allowList = new Set([
        'js/ui/gameLayoutManager.js',
        'js/core/gameBootstrap.js'
    ]);

    const violations = getJsFiles(path.join(repoRoot, 'js'))
        .map((file) => {
            const source = fs.readFileSync(file, 'utf8');
            return {
                file: toRepoPath(file),
                hasGameContainer: source.includes('game-container'),
                hasDistrictContainer: source.includes('district-game-container')
            };
        })
        .filter((entry) => entry.hasGameContainer && entry.hasDistrictContainer && !allowList.has(entry.file))
        .map((entry) => entry.file);

    assert.deepStrictEqual(
        violations,
        [],
        `Unexpected shared container coupling found in: ${violations.join(', ')}`
    );
});

test('core gameplay modules do not directly depend on district container ID', () => {
    const gameCorePath = path.join(repoRoot, 'js/core/game.js');
    const utilityPath = path.join(repoRoot, 'js/core/utility.js');

    const gameCoreSource = fs.readFileSync(gameCorePath, 'utf8');
    const utilitySource = fs.readFileSync(utilityPath, 'utf8');

    assert.strictEqual(gameCoreSource.includes('district-game-container'), false);
    assert.strictEqual(utilitySource.includes('district-game-container'), false);
});
