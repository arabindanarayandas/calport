const { chromium } = require('playwright');
// Opens the built preview. Set PREVIEW_FILE to its path, e.g. PREVIEW_FILE=../portfolio/calport/index.html
const PAGE = 'file://' + require('path').resolve(process.env.PREVIEW_FILE || 'index.html');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
  await p.goto(PAGE);
  await p.fill('#si-email', 'meera@calport.demo'); await p.fill('#si-pass', 'calport123'); await p.click('#signin button[type=submit]'); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = '#/session/b-seed3'; }); await p.reload(); await p.waitForTimeout(400);
  await p.fill('#thx-text', 'Thank you, the structure tip changed everything.'); await p.click('#thx-send'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'gm_sess2.png', fullPage: true });
  await p.selectOption('#persona', 'u-expert'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-nav="impact"]').click()); await p.waitForTimeout(300);
  await p.screenshot({ path: 'gm_impact2.png', fullPage: true });
  console.log('errors', errs); await b.close();
})();
