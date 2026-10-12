import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

test('the upstream shadcn rule detects raw colors and accepts semantic tokens', async () => {
  const directory = fileURLToPath(new URL('../examples/shadcn-lint/', import.meta.url));
  const eslint = new ESLint({ cwd: directory, overrideConfigFile: directory + 'eslint.config.mjs' });
  const [before, after] = await eslint.lintFiles(['before.tsx', 'after.tsx']);
  assert.ok(before.messages.some(m => m.ruleId === 'shadcn/no-raw-colors'), JSON.stringify(before.messages));
  assert.equal(after.errorCount, 0, JSON.stringify(after.messages));
});
