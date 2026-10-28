#!/usr/bin/env python3
"""Build a single-file, fully offline BetterDiscord plugin.

Downloads exactly one pinned upstream GitHub revision, checks its Git blob
SHA-1, then embeds it into the local plugin template. The resulting plugin
never fetches executable code while running in Discord.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
TEMPLATE = ROOT / 'OrionQuestsBackground.plugin.js'
OUTPUT = ROOT / 'dist' / 'OrionQuestsBackground.plugin.js'
URL = 'https://raw.githubusercontent.com/nyxxbit/discord-quest-completer/7b21ac365dd38686d25933dc84d46e2bdb2c2b2a/index.js'
EXPECTED_BLOB = '4f84fb5b0012af64ffe6f01308574539de273ac0'


def git_blob_sha(source: bytes) -> str:
    return hashlib.sha1(b'blob ' + str(len(source)).encode() + b'\0' + source).hexdigest()


def main() -> None:
    req = Request(URL, headers={'User-Agent': 'Orion-BetterDiscord-offline-builder/0.1'})
    with urlopen(req, timeout=30) as response:
        source = response.read()
    actual = git_blob_sha(source)
    if actual != EXPECTED_BLOB:
        raise SystemExit(f'Integrity check failed! Expected {EXPECTED_BLOB}, got {actual}')
    engine = source.decode('utf-8')
    template = TEMPLATE.read_text(encoding='utf-8')
    start = template.index('    async obtainSource() {')
    end = template.index('    patchEngine(source) {', start)
    replacement = (
        '    async obtainSource() {\n'
        f'        if (!this.source) this.source = {json.dumps(engine, ensure_ascii=False)};\n'
        '        return this.source;\n'
        '    }\n\n'
    )
    result = template[:start] + replacement + template[end:]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(result, encoding='utf-8')
    print(f'Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)')
    print('This offline build includes the integrity-checked engine and makes no runtime GitHub requests.')


if __name__ == '__main__':
    main()
