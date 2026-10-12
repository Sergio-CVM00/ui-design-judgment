import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm, cp, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { validateReport } from '../skills/ui-design-judgment/scripts/report.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let directory;
let report;
beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'ui-judgment-test-'));
  await writeFile(path.join(directory, 'surface.png'), png);
  await writeFile(path.join(directory, 'checks.json'), '{"fixture":"schema-regression-only"}');
  report = {
    schemaVersion: 1, build: 'synthetic-validator-fixture', mode: 'review', evaluator: 'unit-test fixture, no visual approval',
    intent: { audience: 'analyst', task: 'monitor revenue', primaryFocus: 'revenue trend', designSystem: 'fixture system', assumptions: [] },
    scope: [{ id: 'a', route: '/', viewport: '1280x800', state: 'default' }], coverage: { inspected: ['a'], missing: [] },
    evidence: [{ id: 'image', path: 'surface.png', kind: 'screenshot', surface: 'a', sha256: hash(png) }, { id: 'checks', path: 'checks.json', kind: 'checks', sha256: hash(Buffer.from('{"fixture":"schema-regression-only"}')) }],
    checks: ['correctness', 'coherence'].map(dimension => ({ id: dimension, dimension, status: 'pass', required: true, surfaces: ['a'], evidence: ['checks'], reason: 'Synthetic record used only for validator regression tests.' })),
    assessment: { correctness: { status: 'pass', rationale: 'Fixture checks recorded.', evidence: ['checks'] }, coherence: { status: 'pass', rationale: 'Fixture policy recorded.', evidence: ['checks', 'image'] }, taste: { status: 'acceptable', rationale: 'Synthetic judgment used to exercise the validator only.', evidence: ['image'] } },
    findings: [], limits: ['This fixture does not test agent taste.'],
  };
});
afterEach(async () => { await rm(directory, { recursive: true, force: true }); });
const run = () => validateReport(report, directory, root);

test('complete consistent records can pass, with an explicit truth limitation', async () => {
  const result = await run();
  assert.equal(result.status, 'pass', JSON.stringify(result));
  assert.match(result.limitations[0], /not aesthetic truth/);
});
test('an unavailable required check cannot be promoted to pass', async () => {
  report.checks[0].status = 'unavailable';
  assert.equal((await run()).status, 'invalid');
  report.assessment.correctness.status = 'unverified';
  assert.equal((await run()).status, 'partial');
});
test('unreviewed taste stays partial despite green machine checks', async () => {
  report.assessment.taste.status = 'unreviewed';
  assert.equal((await run()).status, 'partial');
});
test('incomplete scope and absent screenshots cannot pass', async () => {
  report.scope.push({ id: 'b', route: '/', viewport: '390x844', state: 'error' });
  report.coverage.missing.push('b');
  assert.equal((await run()).status, 'partial');
  report.scope.pop(); report.coverage.missing = []; report.evidence[0].kind = 'other';
  assert.equal((await run()).status, 'invalid');
});
test('modified or missing artifacts are rejected', async () => {
  await writeFile(path.join(directory, 'surface.png'), 'modified');
  assert.equal((await run()).status, 'invalid');
  await rm(path.join(directory, 'surface.png'));
  assert.equal((await run()).status, 'invalid');
});
test('unknown evidence, duplicate ids and unaccounted surfaces are rejected', async () => {
  report.assessment.taste.evidence = ['unknown'];
  assert.equal((await run()).status, 'invalid');
  report.assessment.taste.evidence = ['image']; report.checks.push(report.checks[0]);
  assert.equal((await run()).status, 'invalid');
  report.checks.pop(); report.coverage.inspected = [];
  assert.equal((await run()).status, 'invalid');
});
test('a passing check must cover an inspected surface and each dimension needs required checks', async () => {
  report.coverage = { inspected: [], missing: ['a'] };
  assert.equal((await run()).status, 'invalid');
  report.coverage = { inspected: ['a'], missing: [] }; report.checks[1].required = false;
  assert.equal((await run()).status, 'invalid');
});
test('a contextual primary-task blocker fails and a preference stays advisory', async () => {
  const finding = { id: 'focus', nature: 'judgment', dimension: 'taste', severity: 'advisory', surface: 'a', observation: 'The primary metric competes with supporting metrics.', consequence: 'Locating the task priority requires more scanning.', recommendation: 'Strengthen the primary metric within existing tokens.', verification: 'Inspect the reading order after correction.', evidence: ['image'] };
  report.findings.push(finding);
  assert.equal((await run()).status, 'findings');
  finding.severity = 'blocker';
  assert.equal((await run()).status, 'fail');
});
test('executed checks cannot omit their supporting evidence', async () => {
  report.checks[0].evidence = [];
  assert.equal((await run()).status, 'invalid');
});
test('coherence approval needs rendered evidence as well as policy checks', async () => {
  report.assessment.coherence.evidence = ['checks'];
  assert.equal((await run()).status, 'invalid');
});
test('the copied skill can validate using only project-local dependencies', async () => {
  const copy = path.join(directory, 'installed-skill');
  await mkdir(copy);
  await cp(path.join(root, 'skills/ui-design-judgment'), copy, { recursive: true });
  const module = await import(pathToFileURL(path.join(copy, 'scripts/report.mjs')).href);
  assert.equal((await module.validateReport(report, directory, root)).status, 'pass');
});
