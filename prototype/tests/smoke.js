const { chromium } = require('playwright');
// Opens the built preview. Set PREVIEW_FILE to its path, e.g. PREVIEW_FILE=../portfolio/calport/index.html
const PAGE = 'file://' + require('path').resolve(process.env.PREVIEW_FILE || 'index.html');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [acct, views] of [['aarav', ['home', 'path', 'practice', 'learn', 'experts', 'sessions', 'apps', 'board', 'profile']], ['neha', ['dash', 'requests', 'esessions', 'impact', 'avail', 'eprofile']]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); p.on('pageerror', e => errs.push(acct + ': ' + e.message));
    await p.goto(PAGE);
    await p.fill('#si-email', acct + '@calport.demo'); await p.fill('#si-pass', 'calport123'); await p.click('#signin button[type=submit]'); await p.waitForTimeout(400);
    for (const v of views) { await p.evaluate(v => document.querySelector('[data-nav="' + v + '"]').click(), v); await p.waitForTimeout(150); }
    if (acct === 'aarav') { await p.evaluate(() => document.querySelector('[data-nav="practice"]').click()); await p.waitForTimeout(200); console.log('practice status:', await p.$eval('#st', e => e.textContent).catch(() => '-')); }
  }
  console.log('errors', errs); await b.close();
})();
