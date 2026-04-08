import { test, expect } from '@playwright/test';

// Tests that require the backend API to be running
const apiTest = test.extend({});
apiTest.skip(({ }, testInfo) => !process.env.E2E_WITH_API, 'Requires backend API (set E2E_WITH_API=1)');

test.describe('Pattern Library (/patterns)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patterns');
  });

  test('displays page header', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Pattern Library' })).toBeVisible();
    await expect(page.getByText('AI 하네스 아키텍처 패턴을 탐색')).toBeVisible();
  });

  apiTest('shows category filter buttons', async ({ page }) => {
    await page.goto('/patterns');
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    // Wait for patterns to load from API
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Starter' })).toBeVisible();
  });

  apiTest('displays pattern cards after API load', async ({ page }) => {
    await page.goto('/patterns');
    await expect(page.getByText('Solo')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pipeline')).toBeVisible();
    await expect(page.getByText('Expert Pool')).toBeVisible();
  });

  apiTest('filters patterns by category', async ({ page }) => {
    await page.goto('/patterns');
    await expect(page.getByText('Solo')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Starter' }).click();
    await expect(page.getByText('Solo')).toBeVisible();
  });

  apiTest('clicking a pattern card navigates to detail', async ({ page }) => {
    await page.goto('/patterns');
    await expect(page.getByText('Solo')).toBeVisible({ timeout: 5000 });
    await page.getByText('Solo').first().click();
    await expect(page).toHaveURL(/\/patterns\/solo/);
  });

  test('back link navigates to home', async ({ page }) => {
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Pattern Detail (/patterns/:id)', () => {
  apiTest('displays pattern detail page', async ({ page }) => {
    await page.goto('/patterns/solo');
    await expect(page.getByRole('heading', { level: 1, name: 'Solo' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Starter')).toBeVisible();
    await expect(page.getByText('low')).toBeVisible();
  });

  apiTest('shows 6-axis expected scores', async ({ page }) => {
    await page.goto('/patterns/solo');
    await expect(page.getByText('Expected 6-Axis Scores')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Context Engineering')).toBeVisible();
    await expect(page.getByText('Verification Loops')).toBeVisible();
  });

  apiTest('shows recommended agents and skills', async ({ page }) => {
    await page.goto('/patterns/solo');
    await expect(page.getByText('Recommended Agents')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Recommended Skills')).toBeVisible();
  });

  apiTest('Start with this pattern button navigates to builder', async ({ page }) => {
    await page.goto('/patterns/solo');
    await expect(page.getByText('Start with this pattern')).toBeVisible({ timeout: 5000 });
    await page.getByText('Start with this pattern').click();
    await expect(page).toHaveURL('/create/builder');
  });

  apiTest('back link navigates to patterns list', async ({ page }) => {
    await page.goto('/patterns/solo');
    await expect(page.getByText('Patterns')).toBeVisible({ timeout: 5000 });
    await page.getByText('Patterns').first().click();
    await expect(page).toHaveURL('/patterns');
  });
});
