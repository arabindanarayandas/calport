# Calport prototype

This folder holds the clickable prototype. It's separate from the real app in the rest of this repo.

| File | What it is |
|---|---|
| `calport-main.html` | The **Main version**: the single-file prototype published as a Claude artifact (https://claude.ai/artifact/Q5FGi5w9YSB1xjz85RRCiD). Edit this file, then republish the artifact from it. |
| `build_preview.py` | Turns the Main version into the shareable beta preview at https://auronara.com/calport/ |
| `preview_pairs.json` | The text swaps the preview build makes (AI messages that only work inside Claude) |
| `share-card/` | The link-preview image (`og.png`, made from `og.html` with `make-og.js`) and icons (`icon.svg`, `apple-touch-icon.png`, made with `make-icon.js`) |
| `tests/` | Browser checks (Playwright). Run from a scratch folder with `PREVIEW_FILE=<path to built index.html> node <test>.js`; they print results and save screenshots |

## Updating the preview on auronara.com
1. Change `calport-main.html` and republish the Main version artifact.
2. Clone `arabindanarayandas/portfolio` next to this repo.
3. Run `python3 prototype/build_preview.py ../portfolio/calport/index.html`.
4. If the share card changed, copy `share-card/og.png`, `icon.svg` and `apple-touch-icon.png` into `../portfolio/calport/`.
5. Run the tests against the built file, then commit and push the portfolio repo. GitHub Pages updates the site in about a minute.

## The PREVIEW flag
`calport-main.html` has `var PREVIEW = false;`. The build sets it to `true`, which turns on the following, for the preview only:
- the beta bar
- the "Viewing as" persona switcher
- back/forward buttons and browser history
- page transitions
- home-page tips
- hiding the demo account list on sign-in

All test accounts use the password `calport123` (see the project brief for the list).
