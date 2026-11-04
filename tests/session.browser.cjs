// Real gym flows in iPhone-sized WebKit. Requires Playwright and a local server (SETLINE_URL).
const { webkit, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SETLINE_URL || 'http://127.0.0.1:8087';
const output = process.env.SETLINE_QA_DIR || path.join(__dirname, '../qa');
const storageKey = 'setline-hypertrophy-v1';
const timerKey = 'setline-rest-timer';
fs.mkdirSync(output, {recursive:true});

// Stay silent: the rest-end tone would otherwise play through the speakers of whoever runs this.
// The app only ever sees this stub, which counts the tones it asks for.
function silentAudio() {
  window.tonesPlayed = 0;
  class SilentAudioContext {
    state = 'running'; currentTime = 0; sampleRate = 44100; destination = {};
    createBuffer() { return {}; }
    createBufferSource() { return {connect() {}, start() {}}; }
    createOscillator() { window.tonesPlayed += 1; return {frequency: {setValueAtTime() {}}, connect: node => node, start() {}, stop() {}}; }
    createGain() { return {gain: {setValueAtTime() {}, exponentialRampToValueAtTime() {}}, connect: node => node}; }
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
  }
  window.AudioContext = window.webkitAudioContext = SilentAudioContext;
}

const scenarios = [];
const scenario = (name, run, options) => scenarios.push({name, run, options});
const iphone = {...devices['iPhone 13'], serviceWorkers:'block'};
const desktop = {viewport:{width:1440,height:900}, serviceWorkers:'block'};

const mode = page => page.locator('#timer-dock').getAttribute('data-mode');
const state = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), storageKey);
const entry = async (page, key) => (await state(page))?.entries?.[key] ?? null;
async function seed(page, value) {
  await page.evaluate(([key, data]) => localStorage.setItem(key, JSON.stringify(data)), [storageKey, value]);
  await page.reload();
}
// Console and dialog controls ignore taps for a moment after they appear, so tests pause like a person.
async function press(page, selector, pause = 420) {
  await page.waitForTimeout(pause);
  await page.locator(selector).tap();
}
async function doubleTap(page, selector, gap = 60) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  const box = await page.locator(selector).boundingBox();
  const x = box.x + box.width * .75, y = box.y + box.height / 2;
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(gap);
  await page.touchscreen.tap(x, y);
}
async function confirmReset(page) {
  await press(page, '#sheet-confirm', 650);
  await page.locator('#toast.show').waitFor({timeout:2000});
}
const doneCount = async (page, prefix = 'solo:s-1:') => Object.entries((await state(page)).entries).filter(([key, item]) => key.startsWith(prefix) && item.completed).length;
const stepUp = (page, field) => press(page, `[data-stepper="${field}"][data-direction="1"]`);
async function log(page) {
  // One set from the console, leaving any rest that starts.
  if (await mode(page) === 'rest') await press(page, '#timer-skip');
  await press(page, '#console-done');
}
async function finishSession(page) {
  let taps = 0;
  for (let guard = 0; guard < 80 && await mode(page) !== 'done'; guard += 1) {
    await press(page, await mode(page) === 'rest' ? '#timer-skip' : '#console-done');
    taps += 1;
  }
  return taps;
}
const inViewport = locator => locator.evaluate(element => {
  const box = element.getBoundingClientRect();
  return box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth && box.height > 0;
});

scenario('The current set is on screen on arrival, clear of header and console', async page => {
  const layout = await page.evaluate(() => {
    const bottom = selector => document.querySelector(selector).getBoundingClientRect().bottom;
    const top = selector => document.querySelector(selector).getBoundingClientRect().top;
    return {header: bottom('.mobile-topbar'), row: top('.set-row.is-next-set'), rowEnd: bottom('.set-row.is-next-set'), dock: top('#timer-dock'), height: document.documentElement.scrollHeight};
  });
  assert.ok(layout.header <= 64, `header ${layout.header}`);
  assert.ok(layout.row >= layout.header && layout.rowEnd <= layout.dock, `row ${layout.row}-${layout.rowEnd}, dock ${layout.dock}`);
  assert.ok(layout.height < 2200, `page height ${layout.height}`);
  assert.equal(await page.locator('.exercise-card:not(.is-collapsed)').count(), 1);
  assert.equal(await mode(page), 'work');
});

scenario('A whole session logs from the console without typing, with real numbers', async page => {
  const taps = await finishSession(page);
  assert.ok(taps <= 14 * 2, `${taps} taps for 14 sets`);
  const saved = await state(page);
  const entries = Object.entries(saved.entries).filter(([key]) => key.startsWith('solo:s-1:'));
  assert.equal(entries.filter(([, item]) => item.completed).length, 14);
  assert.ok(entries.every(([, item]) => Number(item.reps) > 0), 'every set has reps');
  await page.waitForFunction(() => document.querySelectorAll('.exercise-card.is-collapsed').length === 6 && scrollY === 0, null, {timeout:3000});
  assert.match(await page.locator('#console-complete-stats').textContent(), /14 series · [\d.,]+ kg·rep/);
  assert.equal(await page.locator('#console-next-day').textContent(), 'Próxima: Espalda y bíceps');
  await press(page, '#console-next-day', 950);
  assert.equal(await page.locator('#switch-title').textContent(), 'Espalda y bíceps');
  assert.equal(await mode(page), 'work');
});

scenario('The next set stays visible as sets and exercises finish', async page => {
  for (let index = 0; index < 5; index += 1) {
    await log(page);
    await page.waitForTimeout(700);
    assert.equal(await inViewport(page.locator('.set-row.is-next-set')), true, `after set ${index + 1}`);
    const row = await page.locator('.set-row.is-next-set').boundingBox();
    const dock = await page.locator('#timer-dock').boundingBox();
    const header = await page.locator('.mobile-topbar').boundingBox();
    assert.ok(row.y >= header.y + header.height && row.y + row.height <= dock.y, `row hidden after set ${index + 1}`);
  }
});

scenario('Raising the weight on a set carries to the sets still to do, not to manual or finished ones', async page => {
  await page.locator('[data-exercise-card="s1-incline"] [data-set-row="2"] [data-weight]').fill('12');
  await page.locator('[data-exercise-card="s1-incline"] [data-set-row="2"] [data-weight]').blur();
  await stepUp(page, 'weight');
  const weights = await page.locator('[data-exercise-card="s1-incline"] [data-weight]').evaluateAll(inputs => inputs.map(input => input.value));
  assert.deepEqual(weights, ['20', '20', '12']);
  await log(page);
  await press(page, '#timer-skip');
  await stepUp(page, 'weight');
  const after = await page.locator('[data-exercise-card="s1-incline"] [data-weight]').evaluateAll(inputs => inputs.map(input => input.value));
  assert.deepEqual(after, ['20', '22,5', '12'], 'set 1 is finished');
});

scenario('Rest: starts on Hecha, adjusts, skips, undoes; never starts after the last set', async page => {
  await stepUp(page, 'reps');
  await stepUp(page, 'reps');
  await press(page, '#console-done');
  assert.equal(await mode(page), 'rest');
  assert.match(await page.locator('#timer-label').textContent(), /sigue serie 2 de 3/);
  const seconds = async () => {
    const [m, s] = (await page.locator('#timer-time').textContent()).split(':').map(Number);
    return m * 60 + s;
  };
  const before = await seconds();
  await press(page, '#timer-plus');
  assert.ok(await seconds() >= before + 13);
  await press(page, '#timer-minus');
  await press(page, '#console-undo');
  assert.equal(await mode(page), 'work');
  const undone = await entry(page, 'solo:s-1:s1-incline:0');
  assert.equal(undone.completed, false);
  assert.equal(undone.reps, '8', 'undo keeps the numbers to correct them');
  assert.equal(await page.locator('#console-reps').inputValue(), '8');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-check]').first().isChecked(), false);
  assert.equal((await state(page)).setLog['solo:s-1:s1-incline:0'], undefined);
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  assert.equal(await mode(page), 'work');
  assert.equal(await page.locator('#console-reps').inputValue(), '8', 'next set proposes the reps just done');
  await finishSession(page);
  assert.equal(await mode(page), 'done');
  assert.equal(await page.evaluate(key => localStorage.getItem(key), timerKey), null);
  assert.equal(await page.locator('#timer-time').textContent(), '00:00');
});

scenario('The rest countdown survives a reload and a corrupted save does not break the app', async page => {
  await press(page, '#console-done');
  await page.waitForTimeout(1100);
  const before = await page.locator('#timer-time').textContent();
  await page.reload();
  assert.equal(await mode(page), 'rest');
  const after = await page.locator('#timer-time').textContent();
  assert.ok(after <= before && after >= '02:20', `${before} → ${after}`);
  assert.match(await page.locator('#timer-label').textContent(), /sigue serie 2 de 3/);
  assert.equal(await page.locator('#console-undo').isVisible(), false, 'no undo for a set from before the reload');
  await page.evaluate(key => localStorage.setItem(key, '{not json'), timerKey);
  await page.reload();
  assert.equal(await mode(page), 'work');
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({deadline: Date.now() - 5000, initial: 90, label: 'Descanso'})), timerKey);
  await page.reload();
  assert.equal(await mode(page), 'work', 'a rest that ended while away does not come back');
});

scenario('The end of a rest is unmistakable and returns to the next set', async page => {
  await press(page, '#console-done');
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify({...saved, deadline: Date.now() + 1500}));
  }, timerKey);
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#timer-dock').classList.contains('is-finished'), null, {timeout:4000});
  assert.equal(await mode(page), 'work');
  assert.match(await page.locator('#console-set').textContent(), /¡Listo! · Serie 2\/3/);
  assert.match(await page.locator('#sr-status').textContent(), /Descanso terminado\. Serie 2 de 3/);
  await press(page, '#console-done', 850);
  assert.equal(await page.locator('#timer-dock').evaluate(dock => dock.classList.contains('is-finished')), false);
  await press(page, '#timer-skip');
  assert.equal(await page.locator('#console-set').textContent(), 'Serie 3/3', 'the alert does not outlive its rest');
});

scenario('Última vez: RESET empties the day, numbers come back as the starting point, references stay', async page => {
  const lastWeek = '2026-01-05';
  const initial = {schemaVersion:3,programId:'solo',dayByProgram:{solo:'s-1'},entries:{'solo:s-2:s2-pullup:0':{reps:'5',completed:true}},references:{'chest:pa-incline':'700'},lastVolumes:{'legacy:x':42},setLog:{}};
  await seed(page, initial);
  await stepUp(page, 'weight');
  await stepUp(page, 'reps');
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  // Pretend that was last week; a set ticked today is not yet "last time".
  await page.evaluate(([key, date]) => {
    const saved = JSON.parse(localStorage.getItem(key));
    Object.values(saved.setLog).forEach(log => log.forEach(item => { item.date = date; }));
    Object.values(saved.entries).forEach(item => { if (item.doneAt) item.doneAt = Date.parse(`${date}T18:00:00`); });
    localStorage.setItem(key, JSON.stringify(saved));
  }, [storageKey, lastWeek]);
  await page.reload();
  assert.match(await page.locator('#session-stale-note').textContent(), /Registrada el 5 ene · 1 de 14 series/);
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  assert.equal(await page.locator('#session-sheet').isVisible(), false);
  await confirmReset(page);
  const saved = await state(page);
  assert.equal(saved.entries['solo:s-1:s1-incline:0'].completed, false);
  assert.equal(saved.entries['solo:s-1:s1-incline:0'].reps, '');
  assert.deepEqual(saved.references, initial.references);
  assert.deepEqual(saved.lastVolumes, initial.lastVolumes);
  assert.deepEqual(saved.entries['solo:s-2:s2-pullup:0'], initial.entries['solo:s-2:s2-pullup:0'], 'other days untouched');
  assert.equal(await page.locator('#session-stale').isVisible(), false);
  assert.match(await page.locator('[data-exercise-card="s1-incline"] .exercise-last').textContent(), /Última vez \(5 ene\): 20 kg × 7/);
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-weight]').first().inputValue(), '20');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-reps]').first().getAttribute('placeholder'), '7');
  assert.equal(await page.locator('#console-weight').inputValue(), '20');
  assert.equal(await page.locator('#console-reps').inputValue(), '7');
  assert.match(await page.locator('#console-hint').textContent(), /última 20 kg × 7/);
  // What the placeholder shows is what a plain tick logs.
  await page.locator('[data-exercise-card="s1-incline"] [data-check]').first().check();
  assert.equal((await entry(page, 'solo:s-1:s1-incline:0')).reps, '7');
});

scenario('Sets logged today become Última vez as soon as RESET clears them', async page => {
  await stepUp(page, 'weight');
  await stepUp(page, 'reps');
  await press(page, '#console-done');
  assert.doesNotMatch(await page.locator('#console-hint').textContent(), /última/, 'nothing to compare yet while the set is the current one');
  await press(page, '#timer-skip');
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  await confirmReset(page);
  assert.match(await page.locator('[data-exercise-card="s1-incline"] .exercise-last').textContent(), /^Última vez \(\d+ \w+\): 20 kg × 7$/);
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-weight]').first().inputValue(), '20');
  assert.equal(await page.locator('#console-reps').inputValue(), '7');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-check]').first().isChecked(), false);
  const log = (await state(page)).setLog['solo:s-1:s1-incline:0'];
  await press(page, '#console-done');
  await press(page, '#console-undo');
  assert.equal(await mode(page), 'work', 'undo after a same-day restart still works');
  assert.deepEqual((await state(page)).setLog['solo:s-1:s1-incline:0'], log, 'and does not cost the numbers it was restarted from');
  await page.reload();
  assert.equal(await page.locator('#console-weight').inputValue(), '20');
  assert.equal(await page.locator('#console-reps').inputValue(), '7');
});

scenario('Data saved by the previous version keeps its numbers through RESET', async page => {
  const legacy = {schemaVersion:3,programId:'solo',dayByProgram:{solo:'s-1'},loadPreset:'normal',entries:{
    'solo:s-1:s1-incline:0':{weight:'21',reps:'9',completed:true,weightSource:'manual'},
    'solo:s-1:s1-incline:1':{weight:'21',reps:'8',completed:true,weightSource:'manual'},
    'solo:s-1:s1-incline:2':{weight:'18',reps:'',completed:false,weightSource:'preset'}
  },references:{},lastVolumes:{'solo:s1-row-db':500},heroSeenByProgram:{solo:true}};
  await seed(page, legacy);
  assert.equal(await page.locator('#console-set').textContent(), 'Serie 3/3');
  assert.equal(await page.locator('#switch-count').textContent(), '2/14');
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  await confirmReset(page);
  assert.match(await page.locator('[data-exercise-card="s1-incline"] .exercise-last').textContent(), /Última vez: 21 kg × 9 · 8/);
  const weights = await page.locator('[data-exercise-card="s1-incline"] [data-weight]').evaluateAll(inputs => inputs.map(input => input.value));
  assert.deepEqual(weights, ['21', '21', '18'], 'the third set was never done, so it stays on the preset');
  assert.deepEqual((await state(page)).lastVolumes, legacy.lastVolumes);
  assert.equal(await page.locator('[data-exercise-card="s1-row-db"] [data-ratio-label]').count(), 1);
});

scenario('Machine taken: another exercise can go first and the session returns to order after', async page => {
  await page.locator('[data-exercise-card="s1-fly"] .exercise-head').tap();
  assert.equal(await page.locator('[data-exercise-card="s1-fly"]').evaluate(card => card.classList.contains('is-collapsed')), false);
  await page.locator('[data-exercise-card="s1-fly"] [data-focus-exercise]').tap();
  assert.equal(await page.locator('#console-name').textContent(), 'Apertura en polea');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"]').evaluate(card => card.classList.contains('is-collapsed')), true);
  await log(page); await log(page);
  await press(page, '#timer-skip');
  assert.equal(await page.locator('#console-name').textContent(), 'Press inclinado con mancuernas');
  await page.waitForTimeout(600);
  assert.equal(await page.locator('[data-exercise-card="s1-fly"]').evaluate(card => card.classList.contains('is-complete') && card.classList.contains('is-collapsed')), true);
});

scenario('A filter never hides where the session is', async page => {
  await page.locator('[data-hero-toggle]').tap();
  await page.locator('[data-filter="Tríceps"]').tap();
  assert.equal(await page.locator('[data-exercise-card]').count(), 1);
  await page.locator('[data-hero-toggle]').tap();
  assert.equal(await page.locator('.session-tools').isVisible(), true, 'an active filter stays visible');
  await page.reload();
  assert.equal(await page.locator('.session-tools').isVisible(), true);
  await page.locator('.console-heading').tap();
  assert.equal(await page.locator('[data-exercise-card]').count(), 6);
  assert.equal((await state(page)).filter, 'Todos');
  assert.equal(await page.locator('.set-row.is-next-set').count(), 1);
});

scenario('Ticking a row with no known reps asks for them; the console does not cover the row being typed', async page => {
  const reps = page.locator('[data-exercise-card="s1-incline"] [data-set-row="0"] [data-reps]');
  await page.locator('[data-exercise-card="s1-incline"] [data-set-row="0"] [data-check]').check();
  assert.equal(await reps.evaluate(input => input === document.activeElement), true);
  assert.equal(await page.locator('#timer-dock').isVisible(), false);
  await reps.fill('9');
  await reps.blur();
  assert.equal(await page.locator('#timer-dock').isVisible(), true);
  const saved = await state(page);
  assert.equal(saved.entries['solo:s-1:s1-incline:0'].reps, '9');
  assert.equal(saved.setLog['solo:s-1:s1-incline:0'][0].reps, '9', 'the correction is what is remembered');
  // A one-set exercise stays open for the number instead of collapsing away from it.
  await seed(page, {schemaVersion:3,programId:'chest',dayByProgram:{chest:'p-home'},entries:{},heroSeenByProgram:{chest:true}});
  await page.locator('[data-exercise-card="ph-pushup"] .exercise-head').tap();
  await page.locator('[data-exercise-card="ph-pushup"] [data-check]').check();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('[data-exercise-card="ph-pushup"]').evaluate(card => card.classList.contains('is-collapsed')), false);
  assert.equal(await page.locator('[data-exercise-card="ph-pushup"] [data-reps]').evaluate(input => input === document.activeElement), true);
});

scenario('Typing in the console keeps it visible and stays in sync with the row', async page => {
  const input = page.locator('#console-reps');
  await input.tap();
  assert.equal(await page.locator('#timer-dock').isVisible(), true);
  await input.fill('');
  await page.keyboard.type('12');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] [data-reps]').first().inputValue(), '12');
  assert.equal(await input.inputValue(), '12');
  await input.fill('');
  await input.blur();
  assert.equal(await input.inputValue(), '6', 'clearing the field falls back to the proposal, not to an empty log');
  await page.locator('#console-weight').fill('17,5');
  await page.locator('#console-weight').blur();
  await press(page, '#console-done');
  const saved = await entry(page, 'solo:s-1:s1-incline:0');
  assert.equal(saved.weight, '17,5');
  assert.equal(saved.reps, '6');
  assert.match(await page.locator('[data-exercise-card="s1-incline"] [data-volume-value]').textContent(), /^105 kg·rep/);
});

scenario('Session sheet: full names, program keeps it open, day closes it, Escape and backdrop close', async page => {
  await page.locator('#session-switch').tap();
  const sheet = page.locator('#session-sheet');
  assert.equal(await sheet.isVisible(), true);
  assert.equal(await page.locator('#session-sheet-title').evaluate(title => title === document.activeElement), true, 'no focus ring on a button for touch users');
  assert.equal(await page.locator('#sheet-programs [data-program]').count(), 5);
  await press(page, '#sheet-programs [data-program="calisthenics"]');
  assert.equal(await sheet.isVisible(), true);
  assert.equal(await page.locator('#sheet-days [data-day]').count(), 2);
  await press(page, '#sheet-days [data-day="c-b"]');
  assert.equal(await sheet.isVisible(), false);
  assert.equal(await page.locator('#session-switch').evaluate(button => button === document.activeElement), true);
  assert.equal(await page.locator('#switch-title').textContent(), 'Base B');
  assert.equal(await page.locator('#console-weight-stepper').isVisible(), false, 'bodyweight has no kg stepper');
  assert.equal(await page.locator('#console-reps-stepper').isVisible(), true);
  await page.locator('#session-switch').tap();
  await page.keyboard.press('Escape');
  assert.equal(await sheet.isVisible(), false);
  assert.equal(await page.locator('#session-switch').evaluate(button => button === document.activeElement), true);
  assert.equal(await page.locator('#session-switch').evaluate(button => getComputedStyle(button).outlineStyle), 'none', 'no ring after a tap');
  await page.locator('#session-switch').tap();
  const box = await sheet.boundingBox();
  assert.ok(box.y > 10, 'there is a backdrop above the sheet to tap');
  await page.waitForTimeout(420);
  await page.touchscreen.tap(195, 3);
  await page.waitForFunction(() => !document.querySelector('#session-sheet').open, null, {timeout:1500});
});

scenario('The install offer only appears when asked for', async page => {
  await page.waitForTimeout(1300);
  assert.equal(await page.locator('#pwa-banner').isVisible(), false);
  await finishSession(page);
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('#pwa-banner').isVisible(), false, 'not even after finishing');
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-install');
  await page.locator('#pwa-banner.is-visible').waitFor({timeout:3000});
  const banner = await page.locator('#pwa-banner').boundingBox();
  const dock = await page.locator('#timer-dock').boundingBox();
  assert.ok(banner.y + banner.height <= dock.y, 'banner sits above the console');
  await page.locator('#pwa-banner-close').tap();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#pwa-banner').isVisible(), false);
});

scenario('Shoulder plan: reps only, no kg or volume, no preset panel', async page => {
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-programs [data-program="shoulder"]');
  await press(page, '#sheet-days [data-day="h-a"]');
  assert.equal(await page.locator('#load-preset-panel').isVisible(), false);
  assert.equal(await page.locator('#console-weight-stepper').isVisible(), false);
  assert.equal(await page.locator('#console-reps').inputValue(), '10');
  assert.equal(await page.locator('#console-hint').textContent(), 'Objetivo 10');
  await page.locator('[data-check]').first().check();
  assert.equal((await entry(page, 'shoulder:h-a:h-wall:0')).reps, '10', 'a single prescribed number logs itself');
  assert.equal(await page.locator('[data-exercise-card="h-wall"] .exercise-foot').isVisible(), false);
  assert.equal(await page.locator('#timer-label').textContent(), 'Descanso · sigue Retracciones con goma');
  await press(page, '#timer-skip');
  await finishSession(page);
  assert.doesNotMatch(await page.locator('#console-complete-stats').textContent(), /reps|kg/);
  assert.equal(await page.locator('#console-next-day').isVisible(), false);
  assert.equal(await page.locator('#console-reset').isVisible(), true);
});

scenario('The interface states data and does not explain itself, on any program or in any state', async page => {
  const explanations = /Volumen semanal|Cómo progresar|Cómo usar esta pauta|Pauta de hombro|Regla de esfuerzo|Control y recuperación|Demostraciones servidas|se conserva|Sesión en curso|Tiempo estimado|Variante mostrada|Extracto del video|Fuente:|Sin dolor|Registra repeticiones|Ajusta la variante|Carga manual|Se vaciarán|fisioterapeuta|174 cm/i;
  const clean = async label => {
    const text = await page.evaluate(() => document.body.innerText);
    const match = text.match(explanations);
    assert.equal(match && match[0], null, label);
  };
  for (const program of ['solo', 'volley', 'chest', 'calisthenics', 'shoulder']) {
    await page.locator('#session-switch').tap();
    await press(page, `#sheet-programs [data-program="${program}"]`);
    await clean(`${program}: session sheet`);
    await page.keyboard.press('Escape');
    await clean(`${program}: session`);
    await page.locator('[data-hero-toggle]').tap();
    await clean(`${program}: Ajustes`);
    await page.locator('[data-hero-toggle]').tap();
    await page.waitForTimeout(420);
  }
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-programs [data-program="solo"]');
  await page.keyboard.press('Escape');
  await press(page, '#console-done');
  await clean('resting');
  await press(page, '#timer-skip');
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  await page.waitForTimeout(300);
  await clean('RESET confirmation');
  assert.equal(await page.locator('#confirm-sheet p').count(), 0, 'just a question and two answers');
  await press(page, '.sheet-cancel', 650);
  assert.equal(await page.locator('.exercise-howto[open]').count(), 0, 'technique stays closed until asked for');
});

scenario('The Mac layout is as quiet as the phone', async page => {
  const text = await page.evaluate(() => document.body.innerText);
  assert.doesNotMatch(text, /Volumen semanal|Cómo progresar|Regla de esfuerzo|Demostraciones servidas|Tiempo estimado/i);
  assert.equal(await page.locator('.exercise-howto[open]').count(), 0);
  assert.equal(await page.locator('[data-exercise-card] .demo-frame:visible').count(), 6, 'GIFs show here too');
  assert.equal(await page.locator('[data-hero-toggle]').isVisible(), false, 'presets and filters are already on screen');
  assert.equal(await page.locator('#load-preset-panel').isVisible(), true);
  assert.equal(await page.locator('.session-tools').isVisible(), true);
}, desktop);

scenario('Every exercise shows its GIF all the time, collapsed or not; technique text stays one tap away', async page => {
  const requests = [];
  page.on('request', request => { if (/\.gif/.test(request.url())) requests.push(request.url()); });
  await page.route(/\.gif/, route => route.abort());
  await page.reload();
  await page.waitForTimeout(300);
  assert.ok(requests.length >= 1, 'GIFs load without opening anything');
  const frames = () => page.locator('[data-exercise-card] .demo-frame').evaluateAll(items => items.map(item => { const box = item.getBoundingClientRect(); return box.width >= 44 && box.height >= 44 && getComputedStyle(item).visibility === 'visible'; }));
  assert.deepEqual(await frames(), [true, true, true, true, true, true], 'all six cards');
  const big = await page.locator('[data-exercise-card="s1-incline"] .demo-frame').boundingBox();
  const small = await page.locator('[data-exercise-card="s1-row-db"] .demo-frame').boundingBox();
  assert.ok(big.width >= 100 && small.width < 60 && small.width >= 44, `current ${big.width}, others ${small.width}`);
  assert.equal(await page.locator('#demo-s1-incline .demo-status').textContent(), 'Sin GIF', 'a GIF that fails says so briefly');
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] .exercise-cue').isVisible(), false);
  await page.locator('[data-exercise-card="s1-incline"] .exercise-howto summary').tap();
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] .exercise-cue').isVisible(), true);
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] .reference-input').isVisible(), true);
  // Tapping a GIF enlarges it and leaves the card as it was, current or collapsed.
  for (const id of ['s1-incline', 's1-row-db']) {
    const card = page.locator(`[data-exercise-card="${id}"]`);
    const collapsed = await card.evaluate(item => item.classList.contains('is-collapsed'));
    await card.locator('.demo-frame').tap();
    assert.equal(await page.locator('#gif-viewer').isVisible(), true, id);
    await page.keyboard.press('Escape');
    assert.equal(await card.evaluate(item => item.classList.contains('is-collapsed')), collapsed, id);
  }
  await page.locator('[data-exercise-card="s1-row-db"] .exercise-title-wrap').tap();
  assert.equal(await page.locator('[data-exercise-card="s1-row-db"]').evaluate(card => card.classList.contains('is-collapsed')), false, 'the rest of the head still opens the card');
});

scenario('GIFs stay visible through a whole session and on every program and session', async page => {
  await finishSession(page);
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('[data-exercise-card] .demo-frame:visible').count(), 6, 'finished cards keep theirs');
  for (const program of ['volley', 'solo', 'chest', 'calisthenics', 'shoulder']) {
    await page.locator('#session-switch').tap();
    await press(page, `#sheet-programs [data-program="${program}"]`);
    const days = await page.locator('#sheet-days [data-day]').evaluateAll(items => items.map(item => item.dataset.day));
    await page.keyboard.press('Escape');
    for (const day of days) {
      await page.waitForTimeout(400);
      await page.locator('#session-switch').tap();
      await press(page, `#sheet-days [data-day="${day}"]`);
      const cards = await page.locator('[data-exercise-card]').count();
      assert.ok(cards > 0);
      assert.equal(await page.locator('[data-exercise-card] .demo-frame:visible').count(), cards, `${program}/${day}`);
    }
  }
  // Video excerpts run full width on the current card, with their pause control, and shrink when folded.
  assert.equal(await page.locator('#switch-title').textContent(), 'Cuidado de hombro');
  const wide = await page.locator('[data-exercise-card="h-wall"] .demo-frame').boundingBox();
  assert.ok(wide.width > 300 && wide.width / wide.height > 1.6, JSON.stringify(wide));
  const toggle = page.locator('[data-exercise-card="h-wall"] [data-demo-toggle]');
  assert.equal(await toggle.isVisible(), true);
  await toggle.tap();
  assert.equal(await toggle.textContent(), 'Reproducir demostración');
  assert.equal(await page.locator('[data-exercise-card="h-wall"]').evaluate(card => card.classList.contains('is-collapsed')), false);
  assert.equal(await page.locator('[data-exercise-card="h-band"] [data-demo-toggle]').isVisible(), false);
});

scenario('Nothing overflows or falls off-screen on any supported width', async (page, context, shots) => {
  for (const [width, height] of [[320, 568], [360, 640], [375, 667], [390, 664], [430, 780], [768, 1024], [844, 390], [1024, 768], [1440, 900]]) {
    await page.setViewportSize({width, height});
    await page.waitForTimeout(60);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
    const dock = await page.locator('#timer-dock').boundingBox();
    if (width <= 880) assert.ok(dock.y >= 0 && dock.y + dock.height <= height && dock.height < height * .62, `dock at ${width}: ${JSON.stringify(dock)}`);
    for (const selector of ['#console-done', '[data-stepper="reps"][data-direction="1"]', '[data-stepper="weight"][data-direction="-1"]']) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, `${selector} at ${width}: ${box.width}×${box.height}`);
      assert.ok(box.x >= 0 && box.x + box.width <= width, `${selector} off-screen at ${width}`);
    }
    await page.waitForTimeout(420);
    await page.locator('#console-done').click();
    assert.equal(await mode(page), 'rest');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `rest overflow at ${width}`);
    for (const selector of ['#timer-minus', '#timer-plus', '#timer-skip', '#console-undo']) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width && box.height >= 44, `${selector} at ${width}: ${JSON.stringify(box)}`);
    }
    await page.waitForTimeout(420);
    await shots(`rest-${width}`);
    await page.locator('#console-undo').click();
    await page.waitForTimeout(250);
    await shots(`work-${width}`);
  }
});

scenario('Touch targets stay at 44 px across the expanded session', async page => {
  await page.locator('[data-hero-toggle]').tap();
  await page.locator('[data-exercise-card="s1-incline"] .exercise-howto summary').tap();
  const small = await page.evaluate(() => [...document.querySelectorAll('button, a, input, summary')]
    .filter(element => element.offsetParent !== null)
    .map(element => {
      // A wrapping label is what the finger actually hits.
      const box = (element.closest('label') || element).getBoundingClientRect();
      return {name:(element.getAttribute('aria-label') || element.textContent || element.placeholder || element.id).trim().slice(0, 40), width:Math.round(box.width), height:Math.round(box.height)};
    })
    .filter(item => item.height < 44 || item.width < 44));
  assert.deepEqual(small, []);
});

scenario('Desktop: the console stays in view without covering a row', async page => {
  await page.locator('.exercise-card:nth-child(2) .exercise-head').click();
  await page.locator('.exercise-card:nth-child(3) .exercise-head').click();
  await page.locator('.exercise-card:nth-child(4) .exercise-head').click();
  await page.evaluate(() => window.scrollTo({top: 500, behavior: 'instant'}));
  await page.waitForTimeout(100);
  const dock = await page.locator('#timer-dock').boundingBox();
  assert.ok(dock.y >= 0 && dock.y <= 40, `console pinned, y=${dock.y}`);
  const main = await page.locator('.session-main').boundingBox();
  assert.ok(dock.x >= main.x + main.width, 'console never overlaps the work sheet');
  await page.locator('[data-stepper="reps"][data-direction="1"]').click();
  await page.locator('#console-done').focus();
  await page.keyboard.press('Enter');
  assert.equal(await mode(page), 'rest');
  assert.equal(await page.locator('#timer-skip').evaluate(button => button === document.activeElement), true, 'keyboard focus follows the console into rest');
  await page.waitForTimeout(420);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#console-done').evaluate(button => button === document.activeElement), true, 'and back to the next set');
  assert.equal(await page.locator('[data-day="s-1"] small').first().textContent(), '1/14');
}, desktop);

// Regressions from an independent review of this flow.
const lastSet = {schemaVersion:3,programId:'solo',dayByProgram:{solo:'s-1'},references:{},lastVolumes:{},heroSeenByProgram:{solo:true}};
const allButLast = page => page.evaluate(() => {
  const entries = {};
  programs.find(program => program.id === 'solo').days[0].exercises.forEach(exercise => {
    for (let index = 0; index < exercise.sets; index += 1) entries[`solo:s-1:${exercise.id}:${index}`] = {weight:'10', reps:'8', completed:true, weightSource:'manual'};
  });
  delete entries['solo:s-1:s1-tri:1'];
  return entries;
});

scenario('Regression: the tap that opens the RESET confirmation cannot answer it', async page => {
  await log(page); await log(page);
  await page.locator('#session-switch').tap();
  await page.waitForTimeout(420);
  await doubleTap(page, '#session-sheet [data-reset-session]');
  await page.waitForTimeout(700);
  assert.equal(await doneCount(page), 2, 'double tap on the RESET row');
  assert.equal(await page.locator('#confirm-sheet').isVisible(), true);
  const cancel = await page.locator('.sheet-cancel').boundingBox();
  const confirm = await page.locator('.sheet-confirm').boundingBox();
  assert.ok(cancel.y > confirm.y, 'on a phone the harmless answer is where the thumb already is');
  await press(page, '.sheet-cancel', 0);
  await page.waitForTimeout(420);
  await finishSession(page);
  await page.waitForTimeout(950);
  await doubleTap(page, '#console-reset');
  await page.waitForTimeout(700);
  assert.equal(await doneCount(page), 14, 'double tap on RESET in the finished console');
  await press(page, '.sheet-cancel', 0);
});

scenario('Regression: extra taps on the last Hecha never wipe the session', async page => {
  for (const gap of [60, 200, 400, 800]) {
    await seed(page, {...lastSet, entries: await allButLast(page)});
    const box = await page.locator('#console-done').boundingBox();
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    for (let tap = 0; tap < 3; tap += 1) {
      await page.touchscreen.tap(x, y);
      await page.waitForTimeout(gap);
    }
    await page.waitForTimeout(700);
    assert.equal(await doneCount(page), 14, `three taps ${gap} ms apart`);
    if (await page.locator('#confirm-sheet').isVisible()) await press(page, '.sheet-cancel', 650);
  }
});

scenario('Regression: a tap aimed at Saltar or Hecha never logs a set by accident', async page => {
  await press(page, '#console-done');
  await page.waitForTimeout(420);
  await doubleTap(page, '#timer-skip');
  await page.waitForTimeout(150);
  assert.equal(await doneCount(page), 1, 'double tap on Saltar');
  assert.equal(await mode(page), 'work');
  await page.waitForTimeout(420);
  await doubleTap(page, '#console-done');
  await page.waitForTimeout(150);
  assert.equal(await doneCount(page), 2, 'double tap on Hecha logs one set');
  assert.equal(await mode(page), 'rest', 'and does not skip the rest');
  const skip = await page.locator('#timer-skip').boundingBox();
  await page.evaluate(() => { timerDeadline = Date.now() + 60; });
  await page.waitForFunction(() => document.querySelector('#timer-dock').classList.contains('is-finished'), null, {timeout:3000});
  await page.waitForTimeout(120);
  await page.touchscreen.tap(skip.x + skip.width / 2, skip.y + skip.height / 2);
  await page.waitForTimeout(100);
  assert.equal(await doneCount(page), 2, 'a tap on Saltar just as the rest ends');
  await press(page, '#console-done', 850);
  assert.equal(await doneCount(page), 3, 'a deliberate Hecha still works');
});

scenario('Regression: holding Enter on Hecha logs one set', async page => {
  await page.locator('#console-done').focus();
  for (let repeat = 0; repeat < 10; repeat += 1) {
    await page.keyboard.down('Enter');
    await page.waitForTimeout(60);
  }
  await page.keyboard.up('Enter');
  assert.equal(await doneCount(page), 1);
}, desktop);

scenario('Regression: undo restores Última vez as it was, with or without an older session', async page => {
  const key = 'solo:s-1:s1-incline:0';
  await seed(page, {...lastSet, entries:{}, setLog:{[key]:[{weight:'20', reps:'9', date:'2026-10-28'}]}});
  await stepUp(page, 'weight');
  await stepUp(page, 'reps');
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  await confirmReset(page);
  const before = (await state(page)).setLog[key];
  assert.equal(before.length, 2);
  await press(page, '#console-done');
  await press(page, '#console-undo');
  assert.deepEqual((await state(page)).setLog[key], before);
  await page.reload();
  assert.equal(await page.locator('#console-weight').inputValue(), '22,5');
  assert.equal(await page.locator('#console-reps').inputValue(), '10');
});

scenario('Regression: undo still removes the set after midnight', async page => {
  const key = 'solo:s-1:s1-incline:0';
  await page.clock.setFixedTime(new Date('2026-11-04T23:59:00'));
  await page.reload();
  await press(page, '#console-done');
  await page.clock.setFixedTime(new Date('2026-11-05T00:00:30'));
  await press(page, '#console-undo');
  assert.equal((await state(page)).setLog[key], undefined);
  assert.equal(await doneCount(page), 0);
});

scenario('Regression: correcting a finished set leaves the set in progress alone', async page => {
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  await stepUp(page, 'weight');
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  const first = page.locator('[data-exercise-card="s1-incline"] [data-set-row="0"] [data-weight]');
  await first.fill('17');
  await first.blur();
  const weights = await page.locator('[data-exercise-card="s1-incline"] [data-weight]').evaluateAll(inputs => inputs.map(input => input.value));
  assert.deepEqual(weights, ['17', '20', '20']);
  assert.equal(await page.locator('#console-weight').inputValue(), '20');
});

scenario('Regression: Hacer ahora survives a reload, so Hecha logs the exercise on screen', async page => {
  await page.locator('[data-exercise-card="s1-fly"] .exercise-head').tap();
  await page.locator('[data-exercise-card="s1-fly"] [data-focus-exercise]').tap();
  await press(page, '#console-done');
  await page.reload();
  assert.match(await page.locator('#timer-label').textContent(), /sigue serie 2 de 2/);
  await press(page, '#timer-skip');
  assert.equal(await page.locator('#console-name').textContent(), 'Apertura en polea');
  await press(page, '#console-done');
  assert.equal((await entry(page, 'solo:s-1:s1-fly:1')).completed, true);
  assert.equal(await entry(page, 'solo:s-1:s1-incline:0').then(item => Boolean(item && item.completed)), false);
});

scenario('Regression: a partial session is not blended with an older one', async page => {
  const key = index => `solo:s-1:s1-incline:${index}`;
  await seed(page, {...lastSet, entries:{}, setLog:{
    [key(0)]:[{weight:'30', reps:'10', date:'2026-11-02'}, {weight:'20', reps:'9', date:'2026-10-28'}],
    [key(1)]:[{weight:'20', reps:'8', date:'2026-10-28'}],
    [key(2)]:[{weight:'20', reps:'7', date:'2026-10-28'}]
  }});
  assert.match(await page.locator('[data-exercise-card="s1-incline"] .exercise-last').textContent(), /^Última vez \(2 nov\): 30 kg × 10$/);
  assert.equal(await page.locator('#ref-s1-incline').inputValue(), '', 'no session reached a blended volume');
});

scenario('Regression: exercises with no preset read properly when only reps are logged', async page => {
  await seed(page, {...lastSet, dayByProgram:{solo:'s-2'}, entries:{}});
  assert.equal(await page.locator('#console-name').textContent(), 'Dominada asistida/lastrada o jalón');
  await press(page, '#console-done'); await press(page, '#timer-skip');
  await press(page, '#console-done'); await press(page, '#timer-skip');
  await press(page, '#console-done');
  await page.waitForTimeout(650);
  assert.match(await page.locator('[data-exercise-card="s2-pullup"] [data-collapsed-summary]').textContent(), /Completado · 18 reps/);
  await page.evaluate(key => {
    const saved = JSON.parse(localStorage.getItem(key));
    Object.values(saved.setLog).forEach(log => log.forEach(item => { item.date = '2026-10-28'; }));
    saved.entries = {};
    localStorage.setItem(key, JSON.stringify(saved));
  }, storageKey);
  await page.reload();
  assert.match(await page.locator('[data-exercise-card="s2-pullup"] .exercise-last').textContent(), /^Última vez \(28 oct\): 6 · 6 · 6 reps$/);
});

scenario('Regression: a weight known only for the first set still reaches the sets below', async page => {
  await seed(page, {schemaVersion:3,programId:'chest',dayByProgram:{chest:'p-a'},entries:{},heroSeenByProgram:{chest:true},focusExerciseId:'pa-row',setLog:{'chest:p-a:pa-row:0':[{weight:'15', reps:'10', date:'2026-10-28'}]}});
  assert.equal(await page.locator('#console-weight').inputValue(), '15');
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  assert.equal(await page.locator('#console-weight').inputValue(), '15', 'shown before it is logged');
  await press(page, '#console-done');
  assert.equal((await entry(page, 'chest:p-a:pa-row:1')).weight, '15');
});

scenario('Regression: switching session drops what belonged to the old one, not the countdown', async page => {
  await press(page, '#console-done');
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-programs [data-program="calisthenics"]');
  await press(page, '#sheet-days [data-day="c-a"]');
  assert.equal(await mode(page), 'rest', 'the rest keeps running');
  assert.equal(await page.locator('#timer-label').textContent(), 'Descanso');
  assert.equal(await page.locator('#console-undo').isVisible(), false);
  await page.reload();
  assert.equal(await page.locator('#timer-label').textContent(), 'Descanso');
  await page.evaluate(() => { timerDeadline = Date.now() + 60; });
  await page.waitForFunction(() => document.querySelector('#timer-dock').classList.contains('is-finished'), null, {timeout:3000});
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-days [data-day="c-b"]', 850);
  assert.equal(await page.locator('#timer-dock').evaluate(dock => dock.classList.contains('is-finished')), false);
  assert.doesNotMatch(await page.locator('#console-set').textContent(), /Listo/);
});

scenario('Regression: cards the user folded do not hide the current set after switching away and back', async page => {
  await page.locator('[data-exercise-card="s1-incline"] .exercise-head').tap();
  await page.locator('[data-exercise-card="s1-row-db"] .exercise-head').tap();
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-days [data-day="s-2"]');
  await page.locator('#session-switch').tap();
  await press(page, '#sheet-days [data-day="s-1"]');
  assert.equal(await page.locator('.set-row.is-next-set').isVisible(), true);
  assert.equal(await page.locator('[data-exercise-card="s1-row-db"]').evaluate(card => card.classList.contains('is-collapsed')), true);
});

scenario('Regression: a restored rest can still sound once the app has been touched', async page => {
  await press(page, '#console-done');
  await page.waitForTimeout(100);
  await page.reload();
  assert.equal(await page.evaluate(() => window.tonesPlayed), 0);
  await page.touchscreen.tap(195, 20);
  await page.waitForTimeout(450);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { timerDeadline = Date.now() + 60; });
  await page.waitForFunction(() => document.querySelector('#timer-dock').classList.contains('is-finished'), null, {timeout:3000});
  assert.equal(await page.evaluate(() => window.tonesPlayed), 1);
});

scenario('Regression: an app left open overnight notices the new day', async page => {
  await page.clock.setFixedTime(new Date('2026-11-04T20:00:00'));
  await page.reload();
  await press(page, '#console-done');
  await press(page, '#timer-skip');
  assert.equal(await page.locator('#session-stale').isVisible(), false);
  await page.clock.setFixedTime(new Date('2026-11-05T08:00:00'));
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.match(await page.locator('#session-stale-note').textContent(), /Registrada el 4 nov · 1 de 14 series/);
  assert.equal(await page.locator('#session-stale').isVisible(), true);
  await page.locator('#session-stale [data-reset-session]').tap();
  await press(page, '.sheet-cancel', 650);
});

scenario('Regression: closing a RESET opened from the sheet returns focus to the session bar', async page => {
  await log(page);
  await page.locator('#session-switch').tap();
  await press(page, '#session-sheet [data-reset-session]');
  await page.waitForTimeout(100);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#session-switch').evaluate(button => button === document.activeElement), true);
  assert.equal(await doneCount(page), 1);
});

scenario('Regression: logged text is shown as text', async page => {
  await seed(page, {...lastSet, entries:{}, setLog:{'solo:s-1:s1-incline:0':[{weight:'<img src=x onerror="window.injected=1">', reps:'9', date:'2026-10-28'}]}});
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => window.injected), undefined);
  assert.equal(await page.locator('[data-exercise-card="s1-incline"] .exercise-last img').count(), 0);
});

scenario('Regression: damaged saved data never leaves a blank app', async page => {
  const key = 'solo:s-1:s1-incline:0';
  for (const damaged of [
    {entries:{[key]:null}}, {entries:{'solo:s-2:s2-pullup:0':null}}, {entries:{[key]:'x'}}, {entries:[1, 2]},
    {entries:{[key]:{weight:{}, reps:[], completed:'yes'}}},
    {setLog:{[key]:'nope'}}, {setLog:{[key]:{}}}, {setLog:{[key]:7}}, {setLog:{[key]:[null]}}, {setLog:'garbage'},
    {setLog:{[key]:[{weight:'20', reps:'9', date:'not-a-date'}]}}, {setLog:{[key]:[{weight:'20', reps:'9', date:12}]}}
  ]) {
    await seed(page, {...lastSet, ...damaged});
    assert.equal(await page.locator('#switch-title').textContent(), 'Torso A', JSON.stringify(damaged));
    assert.equal(await page.locator('#timer-dock').isVisible(), true, JSON.stringify(damaged));
    await press(page, '#console-done');
    assert.equal(await mode(page), 'rest', JSON.stringify(damaged));
    await press(page, '#timer-skip');
  }
});

(async () => {
  const browser = await webkit.launch({headless:true, ...(process.env.SETLINE_WEBKIT_EXECUTABLE ? {executablePath:process.env.SETLINE_WEBKIT_EXECUTABLE} : {})});
  const only = process.env.SETLINE_ONLY;
  let failed = 0, ran = 0;
  try {
    for (const {name, run, options} of scenarios) {
      if (only && !name.toLowerCase().includes(only.toLowerCase())) continue;
      ran += 1;
      const context = await browser.newContext(options || iphone);
      await context.addInitScript(silentAudio);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource|Service Worker/i.test(message.text())) errors.push(message.text()); });
      const shots = label => page.screenshot({path:path.join(output, `${label}.png`)});
      try {
        await page.goto(`${base}/index.html`);
        await run(page, context, shots);
        assert.deepEqual(errors, []);
        console.log(`ok   ${name}`);
      } catch (error) {
        failed += 1;
        console.log(`FAIL ${name}\n     ${String(error.message).split('\n').slice(0, 12).join('\n     ')}`);
        await page.screenshot({path:path.join(output, `fail-${failed}.png`)}).catch(() => {});
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
  console.log(failed ? `${failed} scenario(s) failed` : `PASS: ${ran} scenarios. Engine: WebKit.`);
  process.exitCode = failed ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
