const { chromium } = require('playwright');
// Opens the built preview. Set PREVIEW_FILE to its path, e.g. PREVIEW_FILE=../portfolio/calport/index.html
const PAGE = 'file://' + require('path').resolve(process.env.PREVIEW_FILE || 'index.html');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [w, h, tag] of [[1366, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(tag + ': ' + e.message));
    await p.goto(PAGE);
    await p.fill('#si-email', 'aarav@calport.demo'); await p.fill('#si-pass', 'calport123'); await p.click('#signin button[type=submit]'); await p.waitForTimeout(400);
    await p.evaluate(() => { const u = JSON.parse(localStorage.getItem('calport-v4')); u.users['u-learner'].tips = { _all: true }; u.users['u-y4'].tips = { _all: true }; localStorage.setItem('calport-v4', JSON.stringify(u)); }); await p.reload(); await p.waitForTimeout(400);
    await p.screenshot({ path: `gm_home_${tag}.png`, fullPage: true });
    // answer daily
    await p.click('#ddone'); await p.waitForTimeout(300);
    const sa = await p.$('.sa'); if (sa) await sa.screenshot({ path: `gm_sa_${tag}.png` });
    await p.evaluate(() => document.querySelector('[data-nav="board"]').click()); await p.waitForTimeout(300);
    await p.screenshot({ path: `gm_board_${tag}.png`, fullPage: true });
    await p.click('[data-lbshow="first"]'); await p.waitForTimeout(300);
    console.log(tag, 'me row', await p.$eval('.dt-r.mine, .mine', e => e.textContent).catch(() => '-'));
    await p.click('[data-lb="squad"]'); await p.waitForTimeout(200); await p.screenshot({ path: `gm_squad_${tag}.png` });
    await p.selectOption('#persona', 'u-y4'); await p.waitForTimeout(400);
    await p.screenshot({ path: `gm_y4_${tag}.png`, fullPage: true });
    await p.evaluate(() => document.querySelector('[data-nav="sessions"]').click()); await p.waitForTimeout(300);
    await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find(b => /scorecard|View|Open/.test(b.textContent) && b.closest('.dt-r')); x && x.click(); }); await p.waitForTimeout(300);
    console.log(tag, 'session hash', await p.evaluate(() => location.hash));
    await p.screenshot({ path: `gm_sess_${tag}.png`, fullPage: true });
    await p.selectOption('#persona', 'u-senior'); await p.waitForTimeout(400);
    await p.evaluate(() => document.querySelector('[data-nav="impact"]').click()); await p.waitForTimeout(300);
    await p.screenshot({ path: `gm_impact_${tag}.png`, fullPage: true });
    console.log(tag, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  }
  console.log('errors', errs); await b.close();
})();
