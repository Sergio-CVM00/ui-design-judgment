import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { dependency, schemaValidator } from './runtime.mjs';

export async function inspect(configPath, project = process.cwd()) {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const schema = JSON.parse(await readFile(new URL('../references/inspect.schema.json', import.meta.url), 'utf8'));
  const validate = await schemaValidator(schema, project);
  if (!validate(config)) throw new Error(`Invalid capture config: ${JSON.stringify(validate.errors)}`);
  if (new Set(config.surfaces.map(s => s.id)).size !== config.surfaces.length) throw new Error('Surface ids must be unique.');
  for (const surface of config.surfaces) {
    const ids = (surface.checks ?? []).map(check => check.id);
    if (new Set(ids).size !== ids.length || ids.some(id => ['axe', 'page-errors'].includes(id))) throw new Error(`Duplicate or reserved check ids in ${surface.id}.`);
  }
  const output = path.resolve(path.dirname(configPath), config.outputDir);
  await mkdir(path.dirname(output), { recursive: true });
  await mkdir(output); // Refuse an existing run directory.
  const capture = {
    schemaVersion: 1, build: config.build, createdAt: new Date().toISOString(),
    status: 'partial', environment: { node: process.version, platform: process.platform, browser: 'chromium' },
    surfaces: [], artifacts: [], limitations: [
      'Capture does not approve coherence or taste. Screenshots require contextual visual inspection.',
      'Axe covers supported automated rules in the captured DOM state, not complete accessibility.',
      'Declared geometry checks do not establish optical alignment or detect every clipping/overlap.',
    ],
  };
  let browser;
  let playwright;
  let AxeBuilder;
  async function artifact(file, kind, surface) {
    const data = await readFile(path.join(output, file));
    const result = { id: `${surface}:${kind}`, path: file, kind, surface, sha256: createHash('sha256').update(data).digest('hex') };
    capture.artifacts.push(result);
    return result.id;
  }
  try {
    const loaded = await dependency('@playwright/test', project);
    playwright = loaded.chromium ? loaded : loaded.default;
    if (config.axe !== false) ({ default: AxeBuilder } = await dependency('@axe-core/playwright', project));
    browser = await playwright.chromium.launch({ headless: true });
    capture.environment.browserVersion = browser.version();
    for (const surface of config.surfaces) {
      const result = { ...surface, status: 'partial', checks: [], evidence: [] };
      capture.surfaces.push(result);
      let context;
      try {
        context = await browser.newContext({ viewport: surface.viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
        await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
        const page = await context.newPage();
        page.setDefaultTimeout(config.timeoutMs ?? 10000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const response = await page.goto(surface.url, { waitUntil: 'domcontentloaded', timeout: config.timeoutMs ?? 10000 });
        if (response && !response.ok()) throw new Error(`HTTP ${response.status()} for ${surface.url}`);
        await playwright.expect(page.locator(surface.ready)).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        for (const step of surface.steps ?? []) {
          const locator = page.locator(step.selector);
          if (step.action === 'click') await locator.click();
          if (step.action === 'fill') await locator.fill(step.value);
          if (step.action === 'press') await locator.press(step.value);
        }
        result.actualUrl = page.url();
        for (const check of surface.checks ?? []) {
          const record = { id: check.id, kind: check.kind, status: 'pass', expected: check };
          result.checks.push(record);
          try {
            const locator = check.selector ? page.locator(check.selector) : null;
            if (check.kind === 'visible') await playwright.expect(locator).toBeVisible();
            if (check.kind === 'in-viewport') await playwright.expect(locator).toBeInViewport();
            if (check.kind === 'text') await playwright.expect(locator).toHaveText(check.value);
            if (check.kind === 'css') await playwright.expect(locator).toHaveCSS(check.property, check.value);
            if (check.kind === 'horizontal-overflow') {
              record.observed = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
              playwright.expect(record.observed.scrollWidth - record.observed.viewportWidth).toBeLessThanOrEqual(check.tolerance ?? 1);
            }
            if (check.kind === 'aligned') {
              await playwright.expect(locator).toBeVisible();
              const other = page.locator(check.otherSelector);
              await playwright.expect(other).toBeVisible();
              const a = await locator.boundingBox();
              const b = await other.boundingBox();
              if (!a || !b) throw new Error('A visible bounding box is unavailable.');
              const edge = (box, axis) => ({ left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height, 'center-x': box.x + box.width / 2, 'center-y': box.y + box.height / 2 })[axis];
              record.observed = { first: a, second: b, difference: Math.abs(edge(a, check.axis) - edge(b, check.axis)) };
              playwright.expect(record.observed.difference).toBeLessThanOrEqual(check.tolerance);
            }
          } catch (error) { record.status = 'fail'; record.error = error.message; }
        }
        result.checks.push({ id: 'page-errors', kind: 'page-errors', status: errors.length ? 'fail' : 'pass', observed: errors });
        if (config.axe !== false) {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          await writeFile(path.join(output, `${surface.id}.axe.json`), JSON.stringify(axe, null, 2));
          result.evidence.push(await artifact(`${surface.id}.axe.json`, 'axe', surface.id));
          result.checks.push({ id: 'axe', kind: 'axe', status: axe.violations.length ? 'fail' : 'pass', observed: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
        } else result.checks.push({ id: 'axe', kind: 'axe', status: 'unavailable', reason: 'Explicitly disabled by capture configuration.' });
        await page.screenshot({ path: path.join(output, `${surface.id}.png`), fullPage: true, animations: 'disabled' });
        result.evidence.push(await artifact(`${surface.id}.png`, 'screenshot', surface.id));
        result.status = result.checks.some(c => c.status === 'fail') ? 'findings' : result.checks.some(c => c.status === 'unavailable') ? 'partial' : 'captured';
      } catch (error) {
        result.error = error.message;
      } finally {
        if (context) {
          try {
            await context.tracing.stop({ path: path.join(output, `${surface.id}.trace.zip`) });
            result.evidence.push(await artifact(`${surface.id}.trace.zip`, 'trace', surface.id));
          } catch (error) { result.status = 'partial'; result.traceError = error.message; }
          await context.close();
        }
      }
    }
    capture.status = capture.surfaces.some(s => s.status === 'partial') ? 'partial' : capture.surfaces.some(s => s.status === 'findings') ? 'findings' : 'captured';
  } catch (error) { capture.error = error.message; }
  finally {
    if (browser) {
      try { await browser.close(); }
      catch (error) { capture.status = 'partial'; capture.cleanupError = error.message; }
    }
    await writeFile(path.join(output, 'capture.json'), JSON.stringify(capture, null, 2) + '\n');
  }
  return { output, capture, exitCode: capture.status === 'captured' ? 0 : capture.status === 'findings' ? 1 : 2 };
}
