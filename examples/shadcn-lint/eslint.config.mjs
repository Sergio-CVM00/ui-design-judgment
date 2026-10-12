import shadcn from '@shadcn/lint';
import tseslint from 'typescript-eslint';

// A fixture-specific policy. Merge only selected rules into an existing project.
export default [{
  files: ['**/*.tsx'],
  languageOptions: { parser: tseslint.parser },
  plugins: { shadcn },
  rules: { 'shadcn/no-raw-colors': 'error' },
}];
