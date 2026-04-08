import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays the main title and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'claude-forge' })).toBeVisible();
    await expect(page.getByText('Harness Engineering Platform')).toBeVisible();
  });

  test('renders 4 dashboard cards', async ({ page }) => {
    await expect(page.getByText('New Harness')).toBeVisible();
    await expect(page.getByText('Analyze Harness')).toBeVisible();
    await expect(page.getByText('Pattern Library')).toBeVisible();
    await expect(page.getByText('Learning Guide')).toBeVisible();
  });

  test('New Harness card navigates to /create', async ({ page }) => {
    await page.getByText('New Harness').click();
    await expect(page).toHaveURL('/create');
  });

  test('Analyze Harness card navigates to /analyze', async ({ page }) => {
    await page.getByText('Analyze Harness').click();
    await expect(page).toHaveURL('/analyze');
  });

  test('Pattern Library card navigates to /patterns', async ({ page }) => {
    await page.getByText('Pattern Library').click();
    await expect(page).toHaveURL('/patterns');
  });

  test('Learning Guide card navigates to /learn', async ({ page }) => {
    await page.getByText('Learning Guide').click();
    await expect(page).toHaveURL('/learn');
  });

  test('Canvas Builder link navigates to /create/builder', async ({ page }) => {
    await page.getByText(/Canvas Builder/).click();
    await expect(page).toHaveURL('/create/builder');
  });
});
