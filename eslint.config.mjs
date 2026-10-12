import globals from 'globals';

export default [{
  files: ['**/*.mjs'],
  languageOptions: { globals: { ...globals.node, ...globals.browser } },
  rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], 'no-undef': 'error', 'no-constant-condition': 'error' },
}];
