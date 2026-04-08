import { test, expect } from '@playwright/test';

test.describe('Learning Guide (/learn)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/learn');
  });

  test('displays sidebar with 4 sections', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2, name: 'Learning Guide' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Harness Engineering이란?' })).toBeVisible();
    await expect(page.getByRole('button', { name: '6축 프레임워크' })).toBeVisible();
    await expect(page.getByRole('button', { name: '시작하기 튜토리얼' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'FAQ' })).toBeVisible();
  });

  test('first section is active by default', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Harness Engineering이란?' })).toBeVisible();
    await expect(page.getByText('Harness Engineering은 AI 코딩 에이전트')).toBeVisible();
  });

  test('clicking section switches content', async ({ page }) => {
    // Click FAQ
    await page.getByRole('button', { name: 'FAQ' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'FAQ' })).toBeVisible();

    // Click 6축 프레임워크
    await page.getByRole('button', { name: '6축 프레임워크' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '6축 프레임워크' })).toBeVisible();
    await expect(page.getByText('Context Engineering (컨텍스트 엔지니어링)')).toBeVisible();
  });

  test('tutorial section has step-by-step content', async ({ page }) => {
    await page.getByRole('button', { name: '시작하기 튜토리얼' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '시작하기 튜토리얼' })).toBeVisible();
    await expect(page.getByText('Step 1: 프로젝트 분석')).toBeVisible();
  });

  test('FAQ section has Q&A format', async ({ page }) => {
    await page.getByRole('button', { name: 'FAQ' }).click();
    await expect(page.getByText('하네스가 없어도 Claude Code를 사용할 수 있나요?')).toBeVisible();
  });

  test('Home link navigates back', async ({ page }) => {
    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });
});
