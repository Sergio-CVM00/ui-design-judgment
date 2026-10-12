import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateReport } from '../skills/ui-design-judgment/scripts/report.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const lock = JSON.parse(await readFile(path.join(root, 'sources.lock.json'), 'utf8'));
let count = 0;
for (const source of lock.sources) for (const file of source.files) {
  const bytes = await readFile(path.join(root, file.path));
  if (createHash('sha256').update(bytes).digest('hex') !== file.sha256) throw new Error(`Vendored source changed: ${file.path}`);
  count++;
}
const skill = await readFile(path.join(root, 'skills/ui-design-judgment/SKILL.md'), 'utf8');
if (!/^---\nname: ui-design-judgment\ndescription: .+\nlicense: MIT\n---/m.test(skill)) throw new Error('Invalid skill frontmatter.');
async function links(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.name === 'upstream' || item.name === 'node_modules' || item.name.startsWith('.')) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await links(file);
    else if (item.name.endsWith('.md')) {
      await markdownLinks(file);
    }
  }
}
async function markdownLinks(file) {
  const text = await readFile(file, 'utf8');
  for (const [, target] of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    if (/^https?:/.test(target)) continue;
    await readFile(path.resolve(path.dirname(file), target));
  }
}
await links(path.join(root, 'skills/ui-design-judgment'));
await links(path.join(root, 'evaluation'));
await markdownLinks(path.join(root, 'README.md'));
const exampleDirectory = path.join(root, 'evaluation/evidence');
const manifest = JSON.parse(await readFile(path.join(exampleDirectory, 'manifest.json'), 'utf8'));
for (const artifact of manifest.artifacts) {
  const bytes = await readFile(path.join(exampleDirectory, artifact.path));
  if (createHash('sha256').update(bytes).digest('hex') !== artifact.sha256) throw new Error(`Public evidence changed: ${artifact.path}`);
}
const example = JSON.parse(await readFile(path.join(exampleDirectory, 'revenue-review.json'), 'utf8'));
const result = await validateReport(example, exampleDirectory, root);
if (result.status !== 'partial' || result.errors.length) throw new Error(`The example must honestly remain partial: ${JSON.stringify(result)}`);
console.log(`Skill resources, public evidence example and ${count} pinned upstream files verified.`);
