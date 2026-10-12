import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { schemaValidator } from '../skills/ui-design-judgment/scripts/runtime.mjs';

test('capture schema requires selectors and explicit alignment contracts', async () => {
  const schema = JSON.parse(await readFile(new URL('../skills/ui-design-judgment/references/inspect.schema.json', import.meta.url), 'utf8'));
  const validate = await schemaValidator(schema, process.cwd());
  const config = { build: 'fixture', outputDir: '.evidence/run', surfaces: [{ id: 'a', url: 'http://127.0.0.1:3000', viewport: { width: 1280, height: 800 }, state: 'default', ready: 'main', checks: [{ id: 'aligned', kind: 'aligned', selector: '#a', otherSelector: '#b', axis: 'left', tolerance: 1 }] }] };
  assert.equal(validate(config), true, JSON.stringify(validate.errors));
  delete config.surfaces[0].checks[0].tolerance;
  assert.equal(validate(config), false);
  config.surfaces[0].checks = [{ id: 'visible', kind: 'visible' }];
  assert.equal(validate(config), false);
});
