import { defineConfig, devices } from '@playwright/test';

const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './src',
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: isCI ? 'http://localhost:4173' : 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], headless: false } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], headless: false } },
    { name: 'safari', use: { ...devices['Desktop Safari'], headless: false } },
  ],
  webServer: isCI
    ? {
        command: 'pnpm preview --port 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: false,
        timeout: 60_000,
      }
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
