import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  reporter: 'dot',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'pnpm preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
