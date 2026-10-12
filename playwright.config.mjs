import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  timeout: 120000,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { headless: true, browserName: 'chromium' },
  webServer: { command: 'node tests/server.mjs', url: 'http://127.0.0.1:44261/dashboard.html', reuseExistingServer: false, timeout: 10000 },
});
