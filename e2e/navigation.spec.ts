import { test, expect } from '@playwright/test';

test.describe('Cross-page Navigation', () => {
  test.skip('full navigation flow: Home → Patterns → Detail → Builder — requires API', async ({ page }) => {
    // Start at Home
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'claude-forge' })).toBeVisible();

    // Navigate to Patterns
    await page.getByText('Pattern Library').click();
    await expect(page).toHaveURL('/patterns');
    await expect(page.getByRole('heading', { level: 1, name: 'Pattern Library' })).toBeVisible();

    // Wait for patterns to load, then click Solo
    await expect(page.getByText('Solo')).toBeVisible({ timeout: 5000 });
    await page.getByText('Solo').first().click();
    await expect(page).toHaveURL(/\/patterns\/solo/);

    // Navigate to builder from pattern
    await expect(page.getByText('Start with this pattern')).toBeVisible({ timeout: 5000 });
    await page.getByText('Start with this pattern').click();
    await expect(page).toHaveURL('/create/builder');
  });

  test('full wizard flow: Home → Create → Step 1-5 → Builder', async ({ page }) => {
    await page.goto('/');

    // Navigate to Create
    await page.getByText('New Harness').click();
    await expect(page).toHaveURL('/create');

    // Step 1
    await page.getByPlaceholder('my-awesome-project').fill('nav-test');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2
    await page.getByText('Coding').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3
    await page.getByText('Solo').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 4
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 5 → Builder
    await page.getByRole('button', { name: 'Build in Canvas' }).click();
    await expect(page).toHaveURL('/create/builder');
  });

  test('learn page navigation roundtrip', async ({ page }) => {
    await page.goto('/');

    // Home → Learn
    await page.getByText('Learning Guide').click();
    await expect(page).toHaveURL('/learn');
    await expect(page.getByRole('heading', { level: 1, name: 'Harness Engineering이란?' })).toBeVisible();

    // Learn → Home
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });

  test('analyze page navigation roundtrip', async ({ page }) => {
    await page.goto('/');

    // Home → Analyze
    await page.getByText('Analyze Harness').click();
    await expect(page).toHaveURL('/analyze');

    // Analyze → Home
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });

  test('direct URL access works for all routes', async ({ page }) => {
    // Each route should render without errors
    await page.goto('/');
    await expect(page.getByText('claude-forge')).toBeVisible();

    await page.goto('/create');
    await expect(page.getByText('Project Profile')).toBeVisible();

    await page.goto('/patterns');
    await expect(page.getByText('Pattern Library')).toBeVisible();

    await page.goto('/learn');
    await expect(page.getByText('Learning Guide')).toBeVisible();

    await page.goto('/analyze');
    await expect(page.getByText('Analyze Harness')).toBeVisible();
  });
});
