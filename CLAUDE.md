# Puff Pass

A browser party game: a category appears ("Name a country"), players take turns typing a valid answer before a pufferfish pops. No repeats, typo-tolerant matching, rarity tiers that earn extra hearts, bots, synthesized sound effects, pixel-art seabed UI, and an in-page question bank editor.

## Layout
- `docs/index.html` — the built, self-contained site. GitHub Pages serves this folder.
- `src/engine.js` — answer bank format, normalization, typo-tolerant matching (OSA distance scaled by length).
- `src/data.js` — built-in categories (bank text format: one answer per line, `|` aliases, `# uncommon/rare/legendary` tier headers).
- `src/ui3.js` — all game, lobby, online-room and question-bank logic.
- `src/shell3.html` — markup + CSS with `/*ENGINE*/ /*DATA*/ /*UI*/` placeholders.
- `src/p2p.js` — online play over PeerJS (WebRTC). Implements a small "room" API (join(name,{as:'host'|'guest'}), presence, peers, onPeers, leave). The host's browser is the hub and runs the game; clients mirror the host's presence state. Uses the free public PeerJS signaling server; no accounts.
- `build.py` — rebuilds `docs/index.html` from `src/`. Always run it after editing `src/`.

## Hosting
Deploy with GitHub Pages from the `main` branch, `/docs` folder. Invite links look like `https://<user>.github.io/<repo>/?room=ABCD`.

## Deploy steps for Claude Code
1. `gh auth status` (log in with `gh auth login` if needed).
2. `git init && git add . && git commit -m "Puff Pass"`
3. `gh repo create puff-pass --public --source=. --push`
4. Enable Pages: `gh api -X POST repos/{owner}/puff-pass/pages -f "source[branch]=main" -f "source[path]=/docs"`
5. Get the URL: `gh api repos/{owner}/puff-pass/pages --jq .html_url` (first deploy takes a minute or two).
