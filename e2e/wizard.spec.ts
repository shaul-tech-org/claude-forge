import { test, expect } from '@playwright/test';

test.describe('Harness Wizard (/create)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
  });

  test('Step 1: displays project profile form', async ({ page }) => {
    await expect(page.getByText('Project Profile')).toBeVisible();
    await expect(page.getByText('Step 1 / 5')).toBeVisible();
    await expect(page.getByPlaceholder('my-awesome-project')).toBeVisible();
    await expect(page.getByText('Languages')).toBeVisible();
    await expect(page.getByText('Frameworks')).toBeVisible();
  });

  test('Step 1: Next button disabled when project name empty', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeDisabled();
  });

  test('Step 1: Next button enables after entering project name', async ({ page }) => {
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeEnabled();
  });

  test('Step 1 → Step 2: navigate to work types', async ({ page }) => {
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(page.getByText('Work Types')).toBeVisible();
    await expect(page.getByText('Step 2 / 5')).toBeVisible();
    await expect(page.getByText('Coding')).toBeVisible();
    await expect(page.getByText('Code Review')).toBeVisible();
    await expect(page.getByText('Testing')).toBeVisible();
  });

  test('Step 2: select work types and proceed', async ({ page }) => {
    // Step 1
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2: select work types
    await page.getByText('Coding').click();
    await page.getByText('Testing').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: Architecture Pattern
    await expect(page.getByText('Architecture Pattern')).toBeVisible();
    await expect(page.getByText('Step 3 / 5')).toBeVisible();
  });

  test('Step 3: select pattern and proceed', async ({ page }) => {
    // Step 1
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2
    await page.getByText('Coding').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: select pattern
    await expect(page.getByText('Solo')).toBeVisible();
    await expect(page.getByText('Pipeline')).toBeVisible();
    await expect(page.getByText('Expert Pool')).toBeVisible();
    await page.getByText('Solo').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 4: 6-Axis Design
    await expect(page.getByText('6-Axis Design')).toBeVisible();
    await expect(page.getByText('Step 4 / 5')).toBeVisible();
  });

  test('Step 4: 6-axis design options visible', async ({ page }) => {
    // Navigate to Step 4
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Coding').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Solo').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // 6-axis sections
    await expect(page.getByText('Context Engineering')).toBeVisible();
    await expect(page.getByText('Verification Loops')).toBeVisible();
    await expect(page.getByText('State Management')).toBeVisible();
    await expect(page.getByText('Tool Orchestration')).toBeVisible();
    await expect(page.getByText('Human-in-the-Loop')).toBeVisible();
    await expect(page.getByText('Lifecycle Management')).toBeVisible();
  });

  test('Step 5: review and build', async ({ page }) => {
    // Navigate to Step 5
    await page.getByPlaceholder('my-awesome-project').fill('my-app');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Coding').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Solo').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 5: Review
    await expect(page.getByText('Review & Build')).toBeVisible();
    await expect(page.getByText('my-app')).toBeVisible();
    await expect(page.getByText('solo')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Build in Canvas' })).toBeVisible();
  });

  test('Step 5: Build in Canvas navigates to builder', async ({ page }) => {
    // Full wizard flow
    await page.getByPlaceholder('my-awesome-project').fill('my-app');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Coding').click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Solo').first().click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Build in Canvas' }).click();

    await expect(page).toHaveURL('/create/builder');
  });

  test('Back button returns to previous step', async ({ page }) => {
    await page.getByPlaceholder('my-awesome-project').fill('test-project');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Work Types')).toBeVisible();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Project Profile')).toBeVisible();
  });

  test('language and framework chips toggle on click', async ({ page }) => {
    const tsChip = page.getByRole('button', { name: 'TypeScript' });
    await expect(tsChip).toBeVisible();

    // Click to select
    await tsChip.click();
    await expect(tsChip).toHaveClass(/bg-blue-600/);

    // Click again to deselect
    await tsChip.click();
    await expect(tsChip).not.toHaveClass(/bg-blue-600/);
  });

  test('Home link navigates back', async ({ page }) => {
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });
});
