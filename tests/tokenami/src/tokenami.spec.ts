import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Tokenami Visual Regression Tests', () => {
  test('default', async ({ page }) => {
    await page.goto('/');
    await percySnapshot(page, 'default', {
      widths: [1920, 375],
    });
  });

  test('hover', async ({ page }) => {
    await page.goto('/');
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; --hover:; }',
    });
    await percySnapshot(page, 'hover', {
      widths: [1920, 375],
      scope: '[data-testid="hover-button"]',
    });
  });

  test('selection', async ({ page }) => {
    await page.goto('/?percy-select=1');
    await percySnapshot(page, 'selection', {
      widths: [1920, 375],
      scope: '[data-testid="selection"]',
      enableJavaScript: true,
    });
  });
});
