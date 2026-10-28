const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const filename = path.join(__dirname, '..', 'OrionQuestsCanary.console.js');
const original = fs.readFileSync(filename, 'utf8');

test('Canary console distribution is a complete standalone script', () => {
    assert.doesNotThrow(() => new vm.Script(original, { filename }));
    assert.match(original, /Discord Canary Console Edition/);
    assert.match(original, /7b21ac365dd38686d25933dc84d46e2bdb2c2b2a/);
    assert.match(original, /OrionQuestsCanary/);
    assert.match(original, /function loadModules\(\)/);
    assert.match(original, /QUESTS_SEND_HEARTBEAT_SUCCESS/);
    assert.doesNotMatch(original, /new BdApi\(/);
});

test('session controller starts once, pauses, resumes and fully stops', () => {
    // Replace only the large, independently tested Orion engine body with a stub.
    // This exercises the actual console controller without touching Discord.
    const startMark = '    function runEngine() {\n';
    const endMark = '\n    }\n\n    window[BRIDGE] = bridge;';
    const start = original.indexOf(startMark);
    const end = original.lastIndexOf(endMark);
    assert.ok(start >= 0 && end > start, 'Engine wrapper has stable boundaries');
    const source = original.slice(0, start) +
        '    function runEngine() { window.testLaunches = (window.testLaunches || 0) + 1; }\n' +
        original.slice(end + '\n    }'.length);

    const state = { timerCleared: null };
    const fakeWindow = {};
    const location = { pathname: '/channels/@me' };
    const context = {
        window: fakeWindow,
        location,
        document: { body: {}, getElementById: () => null },
        setInterval: () => 42,
        clearInterval: id => { state.timerCleared = id; },
        console: { info() {}, warn() {}, error() {} }
    };
    vm.runInNewContext(source, context, { filename: 'canary-mock.js' });
    const runner = fakeWindow.OrionQuestsCanary;
    assert.ok(runner);
    assert.equal(fakeWindow.testLaunches, 1);
    assert.equal(runner.status().running, false); // Fake engine never acquires the engine lock.
    location.pathname = '/quest-home';
    assert.equal(runner.isQuestsRoute(), true);
    location.pathname = '/quests/current';
    assert.equal(runner.isQuestsRoute(), true);
    location.pathname = '/channels/@me';
    assert.equal(runner.isQuestsRoute(), false);

    runner.setOption('autoClaim', true);
    assert.equal(runner.settings.autoClaim, true);
    assert.throws(() => runner.setOption('unexpected', true), TypeError);
    runner.pause();
    assert.equal(runner.paused, true);
    runner.resume();
    assert.equal(runner.paused, false);
    assert.equal(fakeWindow.testLaunches, 2);
    runner.stop();
    assert.equal(runner.stopped, true);
    assert.equal(state.timerCleared, 42);
    assert.equal(fakeWindow.OrionQuestsCanary, undefined);
    assert.equal(fakeWindow.__orionCanaryBridge, undefined);
});
