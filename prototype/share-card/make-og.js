const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto('file://' + __dirname + '/og.html'); await p.waitForTimeout(300); await p.screenshot({ path: __dirname + '/og.png' }); await b.close(); })();
