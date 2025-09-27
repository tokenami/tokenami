import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Tokenami Visual Regression Tests', () => {
  test('default', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'default', {
      widths: [1920, 375],
    });
  });

  test('interactive', async ({ page }) => {
    await page.goto('/');
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; --hover:; }',
    });
    await percySnapshot(page, 'interactive', {
      widths: [1920, 375],
      scope: '[data-testid="hover-button"]',
    });
  });
});
