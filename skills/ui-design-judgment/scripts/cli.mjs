#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { inspect } from './inspect.mjs';
import { validateReport } from './report.mjs';

const help = 'Usage: node cli.mjs inspect --config <capture.json> [--project <qa-project>]\n       node cli.mjs validate --report <review.json> [--project <qa-project>]';
try {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help') { console.log(help); }
  else {
    const flags = {};
    const allowed = command === 'inspect' ? ['--config', '--project'] : command === 'validate' ? ['--report', '--project'] : [];
    if (!allowed.length) throw new Error(help);
    for (let i = 0; i < args.length; i += 2) {
      const key = args[i];
      const value = args[i + 1];
      if (!allowed.includes(key) || !value || value.startsWith('--') || flags[key]) throw new Error(`Invalid or duplicate option ${key}.\n${help}`);
      flags[key] = value;
    }
    const project = path.resolve(flags['--project'] ?? process.cwd());
    let result;
    if (command === 'inspect') {
      if (!flags['--config']) throw new Error(help);
      result = await inspect(path.resolve(flags['--config']), project);
      console.log(JSON.stringify({ status: result.capture.status, output: result.output, error: result.capture.error, limitations: result.capture.limitations }, null, 2));
    } else {
      if (!flags['--report']) throw new Error(help);
      const file = path.resolve(flags['--report']);
      result = await validateReport(JSON.parse(await readFile(file, 'utf8')), path.dirname(file), project);
      console.log(JSON.stringify(result, null, 2));
    }
    process.exitCode = result.exitCode;
  }
} catch (error) {
  console.error(JSON.stringify({ status: 'error', message: error.message }));
  process.exitCode = 2;
}
