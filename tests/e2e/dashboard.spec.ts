import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation & Security Guards', () => {
  test('should redirect unauthenticated users from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');

    // Auth middleware should redirect unauthenticated request to /login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should redirect unauthenticated users from /dashboard/reports to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard/reports');

    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should redirect unauthenticated users from /dashboard/audit-logs to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard/audit-logs');

    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
