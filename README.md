# Orion Quests — BetterDiscord background adapter

Unofficial BetterDiscord port of [nyxxbit/discord-quest-completer](https://github.com/nyxxbit/discord-quest-completer) (Orion). The upstream engine is **pinned** to commit `7b21ac365dd38686d25933dc84d46e2bdb2c2b2a` and its Git blob SHA-1 is verified prior to execution. This is a modified adapter, not an official upstream release.

## What changes

- **Background mode:** attempts eligible Quests while Discord Desktop is open, even while you're browsing chats or servers. It cannot run with the Discord app closed.
- **Quests-only dashboard:** Orion's draggable dashboard appears on Discord's `/quest-home` (and `/quests`) route and hides when you navigate elsewhere. Task execution is unaffected by hiding the panel.
- **Start at launch:** the plugin initializes with BetterDiscord. Automatically handles available Quests (all supported types) without asking for the initial selection; rechecks every five minutes after the engine exits.
- **Small status box:** on the Quests route, when the Orion dashboard is not currently mounted, a status box shows the background state with Pause/Resume controls.
- **Pause and cleanup:** pressing `STOP` pauses automation until resumed, and disabling the plugin calls Orion's cleanup to release its temporary game/process patches, event subscriptions, and timers.
- **Settings:** auto-run, auto-enroll, auto-claim, sound, and random delays. Auto-run and auto-enroll default to ON; auto-claim defaults to OFF. Settings persist through BetterDiscord's Data API.
- **BetterDiscord Webpack adapter:** uses BetterDiscord's stable module discovery API first instead of relying exclusively on the console userscript's webpack chunk extraction.

## Install — ready-to-run loader

1. Install [BetterDiscord](https://betterdiscord.app/) on the Discord **desktop** application.
2. Copy `OrionQuestsBackground.plugin.js` to your BetterDiscord plugins folder:
   - Windows: `%appdata%\\BetterDiscord\\plugins`
   - macOS: `~/Library/Application Support/BetterDiscord/plugins`
   - Linux: `~/.config/BetterDiscord/plugins`
3. In Discord → Settings → BetterDiscord → Plugins, enable **OrionQuestsBackground**.
4. Open **Quests**. The engine will run in the background; its UI appears there. The status box allows you to pause or resume it.

The included loader retrieves a **fixed, non-updating** upstream engine from GitHub on its first launch, validates its Git blob hash, and then executes it. It requires connectivity to `raw.githubusercontent.com` when first started, but **does not download newer versions automatically**. A pinned loader is easier to audit than an unchecked "latest version" downloader, but a local bundled version is preferable.

## Build a completely standalone plugin (recommended)

If you have Python 3 installed, run:

```bash
python3 build_offline.py
```

It downloads and verifies the fixed Orion source once and creates `dist/OrionQuestsBackground.plugin.js`, a **single self-contained plugin file**. Install that version in the same way. Unlike the loader, it doesn't fetch code at runtime.

## Important limitations

- **Account safety:** Discord has reportedly applied Quests restrictions and Account Standing violations for inauthentic completion. This plugin does not eliminate that risk and has **not been tested against a live Discord account**.
- **Quest types:** the adapter uses upstream Orion's five quest handlers, but not every task is feasible. In particular, Orion's original `STREAM_ON_DESKTOP` method remains unreliable because Discord verifies a real active stream and viewers.
- **Achievement tasks:** `ACHIEVEMENT_IN_ACTIVITY` may require the original Orion **localhost relay** running on desktop, because Discord blocks direct calls to `discordsays.com`. This BetterDiscord wrapper does not install a privileged native transport. Read upstream's [README](https://github.com/nyxxbit/discord-quest-completer#achievement-quests) before enabling those flows. The original engine requests explicit approval before OAuth authorization.
- Auto-run processes all eligible quests by default. Disable auto-run in plugin settings if you prefer manual control.
- Discord changes its private internals frequently. The pinned source can become incompatible; errors fail closed rather than dynamically downloading unreviewed code.
- There is no way for this plugin to function when Discord Desktop is fully closed; "background" means within the running Discord client.

## Code layout

- `OrionQuestsBackground.plugin.js`: installable BetterDiscord plugin, pinned loader with engine integration, UI lifecycle, and settings.
- `build_offline.py`: one-command standalone bundler.
- `tests/`: static and lifecycle checks.
- `LICENSE`: MIT original source attribution and derivative licensing.

## Credit and license

Based on Orion by **Gabriel Bertolassi / nyxxbit**, licensed MIT. Original code copyright (c) 2026 Gabriel Bertolassi. Additional BetterDiscord adaptation distributed under the MIT license. Not affiliated with Discord, BetterDiscord, or the upstream maintainers.

## Краткая инструкция на русском

1. Скачай `OrionQuestsBackground.plugin.js` и положи его в папку плагинов BetterDiscord.
2. Активируй плагин в настройках Discord → BetterDiscord → Plugins.
3. Плагин запускает движок при работе Discord; обработка продолжается и во время переходов в чаты.
4. Панель Orion появляется на вкладке **Quests**. Если текущий проход закончен, вместо панели отображается компактный статус с кнопкой Pause/Resume.
5. Настройки автоматического принятия, получения награды и звука доступны через шестерёнку BetterDiscord.

**Важно:** нарушение правил Discord может повлечь санкции к аккаунту. Исходный движок не гарантирует выполнение каждого Quests. На обычном Discord Desktop задания типа Achievement часто требуют отдельного localhost relay из исходного проекта. Это пользовательский плагин, **не соответствующий требованиям публикации в официальной библиотеке BetterDiscord**: её правила прямо запрещают автоматическое выполнение Quests и загрузку удалённых библиотек. Использовать только как локальный экспериментальный плагин.

## GitHub repository

This BetterDiscord adaptation is maintained here: **https://github.com/R1universe/discord-quests-auto-orbs**.

- Direct plugin file: [OrionQuestsBackground.plugin.js](./OrionQuestsBackground.plugin.js)
- Run static tests with `node --test tests/plugin.test.cjs`.
- Build an offline standalone plugin locally with `python3 build_offline.py`.

Please retain the original Orion attribution when reusing or distributing code. The BetterDiscord adaptation is experimental and has not been validated against a live Discord client.
