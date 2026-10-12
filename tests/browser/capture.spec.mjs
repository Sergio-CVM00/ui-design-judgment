import { test, expect } from '@playwright/test';
import { mkdir, writeFile, readFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inspect } from '../../skills/ui-design-judgment/scripts/inspect.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const surface = (id, variant, width = 1280) => ({ id, url: `http://127.0.0.1:44261/dashboard.html?variant=${variant}`, viewport: { width, height: 900 }, state: 'default', ready: 'main', checks: [{ id: 'document-width', kind: 'horizontal-overflow' }, { id: 'heading', kind: 'visible', selector: 'h1' }] });
async function run(config, testInfo) {
  const directory = testInfo.outputPath('run');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, 'config.json');
  await writeFile(file, JSON.stringify({ build: process.env.GITHUB_SHA ?? 'local-browser-fixtures', outputDir: 'evidence', timeoutMs: 3000, ...config }));
  return inspect(file, root);
}

test('capture valid alternatives, responsive states, interaction and seeded geometry defects', async ({}, testInfo) => {
  const interaction = surface('interaction', 'b');
  interaction.state = 'review queue opened';
  interaction.steps = [{ action: 'click', selector: '#show-orders' }];
  interaction.checks.push({ id: 'queue-open', kind: 'text', selector: '#orders-panel h2', value: 'Review queue opened' });
  const alignment = surface('alignment', 'a');
  alignment.checks.push({ id: 'declared-left-edge', kind: 'aligned', selector: '#revenue', otherSelector: '#show-orders', axis: 'left', tolerance: 1 });
  const result = await run({ surfaces: [surface('a-desktop', 'a'), surface('b-desktop', 'b'), surface('c-desktop', 'c'), surface('d-desktop', 'd'), surface('b-mobile', 'b', 390), surface('overflow', 'e'), alignment, interaction] }, testInfo);
  expect(result.capture.status, JSON.stringify(result.capture)).toBe('findings');
  for (const id of ['a-desktop', 'b-desktop', 'c-desktop', 'd-desktop', 'b-mobile', 'interaction']) {
    const selected = result.capture.surfaces.find(s => s.id === id);
    expect(selected.status, JSON.stringify(selected)).toBe('captured');
  }
  expect(result.capture.surfaces.find(s => s.id === 'overflow').checks.find(c => c.id === 'document-width').status).toBe('fail');
  expect(result.capture.surfaces.find(s => s.id === 'alignment').checks.find(c => c.id === 'declared-left-edge').status).toBe('fail');
  expect(result.capture.artifacts.filter(a => a.kind === 'screenshot')).toHaveLength(8);
  expect(result.capture.artifacts.filter(a => a.kind === 'trace')).toHaveLength(8);
  await testInfo.attach('capture-manifest', { path: path.join(result.output, 'capture.json'), contentType: 'application/json' });
});

test('navigation failure and disabled accessibility remain partial with durable evidence', async ({}, testInfo) => {
  const missing = surface('missing', 'a'); missing.url = 'http://127.0.0.1:44261/not-found';
  const result = await run({ axe: false, surfaces: [surface('without-axe', 'a'), missing] }, testInfo);
  expect(result.capture.error, JSON.stringify(result.capture)).toBeUndefined();
  expect(result.exitCode).toBe(2);
  expect(result.capture.status).toBe('partial');
  expect(result.capture.surfaces.find(s => s.id === 'missing').error).toContain('HTTP 404');
  expect(result.capture.surfaces.find(s => s.id === 'without-axe').status).toBe('partial');
  expect(JSON.parse(await readFile(path.join(result.output, 'capture.json'), 'utf8')).status).toBe('partial');
});

test('a copied standalone skill captures with project-local dependencies', async ({}, testInfo) => {
  const directory = testInfo.outputPath('portable');
  await mkdir(directory, { recursive: true });
  await cp(path.join(root, 'skills/ui-design-judgment'), path.join(directory, 'skill'), { recursive: true });
  const module = await import(pathToFileURL(path.join(directory, 'skill/scripts/inspect.mjs')).href);
  const config = path.join(directory, 'config.json');
  await writeFile(config, JSON.stringify({ build: 'portable-skill-fixture', outputDir: 'evidence', surfaces: [surface('portable', 'b')] }));
  const result = await module.inspect(config, root);
  expect(result.capture.status, JSON.stringify(result.capture)).toBe('captured');
  expect(result.capture.artifacts.some(a => a.kind === 'screenshot')).toBe(true);
});
