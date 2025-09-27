import { test } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test.describe('Tokenami Visual Regression Tests', () => {
  test('desktop view', async ({ page }) => {
    await page.goto('/');
    await argosScreenshot(page, 'desktop');
  });

  test('mobile view', async ({ page }) => {
    await page.goto('/');
    await argosScreenshot(page, 'mobile', {
      viewports: ['iphone-7'],
    });
  });

  test('interactive states', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="hover-button"]').hover();
    await argosScreenshot(page, 'interactive');
  });
});
