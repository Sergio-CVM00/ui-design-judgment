import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
      const text = await readFile(file, 'utf8');
      for (const [, target] of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        if (/^https?:/.test(target)) continue;
        await readFile(path.resolve(path.dirname(file), target));
      }
    }
  }
}
await links(path.join(root, 'skills/ui-design-judgment'));
console.log(`Skill resources and ${count} pinned upstream files verified.`);
