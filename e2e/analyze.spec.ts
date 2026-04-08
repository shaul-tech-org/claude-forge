import { test, expect } from '@playwright/test';

test.describe('Analyze Harness (/analyze)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('displays page header', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Analyze Harness' })).toBeVisible();
    await expect(page.getByText('기존 .claude/ 설정을 업로드')).toBeVisible();
  });

  test('shows drag and drop upload area', async ({ page }) => {
    await expect(page.getByText('Drag & drop .claude/ ZIP file')).toBeVisible();
    await expect(page.getByText('Browse files')).toBeVisible();
  });

  test('has file input for zip upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"][accept=".zip"]');
    await expect(fileInput).toBeAttached();
  });

  test('Home link navigates back', async ({ page }) => {
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });
});
