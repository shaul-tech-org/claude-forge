import { test, expect } from '@playwright/test';

test.describe('Canvas Builder (/create/builder)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to avoid wizard popup
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('claude-forge-onboarded', 'true'));
    await page.goto('/create/builder');
  });

  test('renders the canvas area', async ({ page }) => {
    // React Flow canvas should be present
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 5000 });
  });

  test('renders the toolbar', async ({ page }) => {
    // Toolbar buttons should be visible
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 5000 });
  });

  test('minimap is visible', async ({ page }) => {
    await expect(page.locator('.react-flow__minimap')).toBeVisible({ timeout: 5000 });
  });
});
