const { test } = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const Plugin = require('../OrionQuestsBackground.plugin.js');

global.window = {};
global.crypto = webcrypto;
global.location = { pathname: '/channels/@me' };
global.document = {
  getElementById: () => null,
  createElement: () => ({
    style: {}, append() {}, appendChild() {}, remove() {},
    querySelector: () => ({ textContent: '', onclick: null }),
  }),
  body: { appendChild() {} },
};
global.BdApi = class {
  constructor() {
    this.Data = { load: () => null, save() {} };
    this.Net = { fetch: async () => { throw new Error('test network disabled'); } };
    this.UI = { showToast() {} };
  }
};

test('metadata and BetterDiscord lifecycle are present', () => {
  const plugin = new Plugin();
  assert.equal(typeof plugin.start, 'function');
  assert.equal(typeof plugin.stop, 'function');
  assert.equal(typeof plugin.getSettingsPanel, 'function');
  assert.equal(plugin.settings.autoRun, true);
  assert.equal(plugin.settings.autoClaim, false);
});

test('detects both Quests routes while ignoring normal chats', () => {
  const plugin = new Plugin();
  location.pathname = '/quest-home'; assert.equal(plugin.isQuestsRoute(), true);
  location.pathname = '/quests/active'; assert.equal(plugin.isQuestsRoute(), true);
  location.pathname = '/channels/@me/123'; assert.equal(plugin.isQuestsRoute(), false);
  location.pathname = '/quest-homes'; assert.equal(plugin.isQuestsRoute(), false);
});

test('rejects unverified upstream code', async () => {
  const plugin = new Plugin();
  await assert.rejects(plugin.verifyGitBlob('unreviewed JS'), /integrity mismatch/i);
});

test('source modification fails closed when upstream format changes', () => {
  const plugin = new Plugin();
  assert.throws(() => plugin.patchEngine('const a = 1;'), /Unexpected upstream engine format/);
});

test('lifecycle cleans up timers and bridge on stop', () => {
  const plugin = new Plugin();
  plugin.settings.autoRun = false;
  location.pathname = '/channels/@me';
  plugin.start();
  assert.equal(plugin.stopped, false);
  assert.ok(window.__orionBDBridge);
  plugin.stop();
  assert.equal(plugin.stopped, true);
  assert.equal(plugin.timer, null);
  assert.equal(window.__orionBDBridge, undefined);
});
