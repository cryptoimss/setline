const { webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SETLINE_URL || 'http://127.0.0.1:8087';
const output = process.env.SETLINE_QA_DIR || path.join(__dirname, '../qa');
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await webkit.launch({headless:true, ...(process.env.SETLINE_WEBKIT_EXECUTABLE ? {executablePath:process.env.SETLINE_WEBKIT_EXECUTABLE} : {})});
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Seed training state without running the training view or touching real user data.
    await page.goto(base + '/catalog.html');
    await page.waitForFunction(() => document.querySelectorAll('.card').length === 25);
    const fixture = JSON.stringify({schemaVersion:3,programId:'shoulder',dayByProgram:{shoulder:'h-a'},entries:{'shoulder:h-a:h-wall:0':{reps:'8',completed:true}},references:{'solo:s1-incline':'600'}});
    await page.evaluate(value => localStorage.setItem('setline-hypertrophy-v1', value), fixture);
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('.card').length === 25);
    assert.equal(await page.locator('input[type=number], input[type=checkbox], [data-program], [data-rest]').count(), 0);
    for (const [source, count] of [['p159',3], ['p174',8], ['p179',8], ['advanced',3], ['video-ufu',6]]) {
      await page.locator(`[data-filter=${source}]`).click();
      assert.equal(await page.locator('.card').count(), count);
    }
    assert.equal(await page.locator('.card button').count(), 0);
    assert.equal(await page.locator('.card a[href*="UFuQ2SYwt68"]').count(), 6);
    await page.screenshot({path:path.join(output,'new-video-references.png')});
    await page.locator('[data-filter=all]').click();
    await page.locator('#catalog-search').fill('rotacion externa');
    assert.equal(await page.locator('.card').count(), 5);
    await page.locator('#catalog-search').fill('no existe este ejercicio');
    assert.equal(await page.locator('#catalog-empty').isVisible(), true);
    await page.locator('#clear-filters').click();
    assert.equal(await page.locator('.card').count(), 25);
    for (const width of [320,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0,0); });
      await page.screenshot({path:path.join(output,`catalog-${width}.png`),fullPage:width===1440});
    }
    await page.setViewportSize({width:390,height:844});
    await page.locator('.card button').first().click();
    await page.locator('#photo-image').evaluate(image => image.decode());
    assert.equal(await page.locator('#photo-viewer').isVisible(),true);
    assert.equal(await page.locator('#photo-close').evaluate(button => button===document.activeElement),true);
    await page.screenshot({path:path.join(output,'catalog-photo-mobile.png')});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#photo-viewer').isVisible(),false);
    assert.equal(await page.locator('.card button').first().evaluate(button => button===document.activeElement),true);
    assert.equal(await page.evaluate(() => localStorage.getItem('setline-hypertrophy-v1')),fixture);
    // Wait for a complete precache; the two documents must remain distinct offline.
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.active) throw new Error('Service worker not active');
      await Promise.all((await caches.keys()).map(async key => {
        const cache=await caches.open(key);
        if(key.startsWith('setline-shell-') && !(await cache.match('./assets/consultation/catalog.json'))) throw new Error('Catalog not precached');
      }));
    });
    // Force catalog navigation through the worker online before testing shell isolation.
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll('.card').length === 25);
    await context.setOffline(true);
    await page.goto(base + '/index.html');
    assert.equal(await page.title(),'Setline — Rutinas de hipertrofia');
    for(const width of [320,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`training overflow at ${width}`);
      assert.ok(await page.locator('a[href="./catalog.html"]:visible').count() > 0);
      await page.screenshot({path:path.join(output,`training-${width}.png`)});
    }
    await page.goto(base + '/catalog.html');
    await page.waitForFunction(() => document.querySelectorAll('.card').length === 25);
    await page.locator('.card button').first().click();
    await page.locator('#photo-image').evaluate(image => image.decode());
    await page.keyboard.press('Escape');
    await context.setOffline(false);
    assert.deepEqual(errors,[]);
    await context.close();
    // A fresh browser without cached data shows a recoverable fetch failure.
    const failureContext = await browser.newContext({serviceWorkers:'block'});
    const failurePage = await failureContext.newPage();
    await failurePage.route('**/catalog.json', route => route.abort());
    await failurePage.goto(base + '/catalog.html');
    await failurePage.locator('#catalog-error').waitFor({state:'visible'});
    await failurePage.unroute('**/catalog.json');
    await failurePage.locator('#retry-catalog').click();
    await failurePage.waitForFunction(() => document.querySelectorAll('.card').length === 25);
    await failureContext.close();
    console.log('PASS: 25 references; source/search/advanced filters; empty/retry; photo keyboard focus; four widths; preserved training state; offline catalog/photos and independent training shell; no page errors. Engine: WebKit.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
