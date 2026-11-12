const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 180, height: 180 } });
await p.goto('file://' + __dirname + '/icon.html'); await p.screenshot({ path: __dirname + '/apple-touch-icon.png' }); await b.close(); })();
