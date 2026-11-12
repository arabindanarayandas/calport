const { chromium } = require('playwright');
// Opens the built preview. Set PREVIEW_FILE to its path, e.g. PREVIEW_FILE=../portfolio/calport/index.html
const PAGE = 'file://' + require('path').resolve(process.env.PREVIEW_FILE || 'index.html');
(async () => {
  const b = await chromium.launch(); const errs = [];
  for (const [w, h, tag] of [[1366, 860, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(tag + ': ' + e.message));
    await p.goto(PAGE);
    console.log(tag, 'demo rows on login:', await p.$$eval('.demo-row', x => x.length), '| beta note:', !!(await p.$('.beta-login')), '| bar:', !!(await p.$('#beta')));
    await p.screenshot({ path: 'pv_login_' + tag + '.png' });
    await p.fill('#si-email', 'aarav@calport.demo'); await p.fill('#si-pass', 'calport123'); await p.click('#signin button[type=submit]'); await p.waitForTimeout(400);
    console.log(tag, 'hash', await p.evaluate(() => location.hash), 'tips', await p.$$eval('.tip', x => x.length));
    await p.screenshot({ path: 'pv_home_' + tag + '.png' });
    await p.evaluate(() => document.querySelector('[data-nav="path"]').click()); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelector('[data-nav="experts"]').click()); await p.waitForTimeout(300);
    console.log(tag, 'after nav', await p.evaluate(() => location.hash));
    await p.goBack(); await p.waitForTimeout(300); console.log(tag, 'browser back ->', await p.evaluate(() => location.hash), await p.$eval('[aria-current="page"]', e => e.textContent));
    await p.click('#bk-back'); await p.waitForTimeout(300); console.log(tag, 'bar back ->', await p.evaluate(() => location.hash), 'back disabled', await p.$eval('#bk-back', e => e.disabled));
    await p.click('#bk-fwd'); await p.waitForTimeout(300); console.log(tag, 'bar fwd ->', await p.evaluate(() => location.hash));
    await p.goForward(); await p.waitForTimeout(300); console.log(tag, 'browser fwd ->', await p.evaluate(() => location.hash), 'fwd disabled', await p.$eval('#bk-fwd', e => e.disabled));
    // tips
    await p.evaluate(() => document.querySelector('[data-nav="home"]').click()); await p.waitForTimeout(300);
    await p.click('[data-tipx="l-next"]'); await p.waitForTimeout(300); console.log(tag, 'tips after got it', await p.$$eval('.tip', x => x.length));
    // persona
    await p.selectOption('#persona', 'u-y4'); await p.waitForTimeout(400); console.log(tag, '4th year:', await p.$eval('.side .me b', e => e.textContent).catch(()=>'-'), await p.evaluate(() => location.hash));
    await p.selectOption('#persona', 'u-expert'); await p.waitForTimeout(400); console.log(tag, 'expert:', await p.evaluate(() => location.hash), 'tips', await p.$$eval('.tip', x => x.length));
    await p.screenshot({ path: 'pv_dash_' + tag + '.png' });
    await p.selectOption('#persona', 'u-new'); await p.waitForTimeout(400); console.log(tag, 'new:', await p.evaluate(() => location.hash), 'bar', !!(await p.$('#persona')));
    await p.screenshot({ path: 'pv_new_' + tag + '.png' });
    await p.selectOption('#persona', 'u-demo'); await p.waitForTimeout(400); console.log(tag, 'fresh:', await p.evaluate(() => location.hash));
    await p.screenshot({ path: 'pv_fresh_' + tag + '.png' });
    // reload keeps page
    await p.selectOption('#persona', 'u-learner'); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('[data-nav="sessions"]').click()); await p.waitForTimeout(300);
    await p.reload(); await p.waitForTimeout(500); console.log(tag, "reload ->", await p.evaluate(() => location.hash), await p.$eval("[aria-current=page]", e => e.textContent).catch(()=>"none"));
    console.log(tag, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  }
  console.log('errors', errs); await b.close();
})();
