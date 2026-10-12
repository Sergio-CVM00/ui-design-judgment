import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function dependency(name, project = process.cwd()) {
  const require = createRequire(path.join(path.resolve(project), 'package.json'));
  try {
    return await import(pathToFileURL(require.resolve(name)).href);
  } catch (error) {
    throw new Error(`Cannot load ${name} from ${project}. Install the documented QA dependencies with the project's package manager. ${error.message}`);
  }
}

export async function schemaValidator(schema, project) {
  const { default: Ajv } = await dependency('ajv', project);
  // Draft-07 conditionals may require a property declared by their parent schema.
  return new Ajv({ allErrors: true, strict: true, strictRequired: false }).compile(schema);
}
