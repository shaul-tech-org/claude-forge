import { test, expect } from '@playwright/test';

const BASE_URL = 'https://claude-forge.shaul.kr';

test.describe('사이트 상태 확인', () => {
  test('홈페이지 접속 가능', async ({ page }) => {
    const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);

    const title = await page.title();
    console.log(`  Title: ${title}`);
    console.log(`  Status: ${response!.status()}`);
    console.log(`  URL: ${page.url()}`);
  });

  test('주요 페이지 라우팅 확인', async ({ page }) => {
    const routes = ['/', '/patterns', '/create', '/analyze', '/learn'];

    for (const route of routes) {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const status = response?.status() ?? 0;
      console.log(`  ${route} → ${status}`);
      expect(status).toBeLessThan(400);
    }
  });

  test('홈페이지 주요 요소 렌더링', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });

    // 페이지 콘텐츠 스냅샷
    const bodyText = await page.locator('body').innerText();
    console.log(`  Body text (first 500 chars):\n${bodyText.slice(0, 500)}`);

    // 네비게이션 링크 확인
    const links = await page.locator('a[href]').evaluateAll(els =>
      els.map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
    );
    console.log(`  Links found: ${links.length}`);
    for (const link of links.slice(0, 20)) {
      console.log(`    [${link.text}] → ${link.href}`);
    }
  });

  test('정적 리소스 로딩', async ({ page }) => {
    const failedResources: string[] = [];
    page.on('requestfailed', req => {
      failedResources.push(`${req.failure()?.errorText} - ${req.url()}`);
    });

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });

    if (failedResources.length > 0) {
      console.log('  Failed resources:');
      failedResources.forEach(r => console.log(`    ${r}`));
    } else {
      console.log('  All resources loaded successfully');
    }

    if (consoleErrors.length > 0) {
      console.log('  Console errors:');
      consoleErrors.forEach(e => console.log(`    ${e}`));
    } else {
      console.log('  No console errors');
    }

    expect(failedResources).toHaveLength(0);
  });

  test('스크린샷 캡처', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: 'test-results/site-screenshot.png', fullPage: true });
    console.log('  Screenshot saved to test-results/site-screenshot.png');
  });
});
