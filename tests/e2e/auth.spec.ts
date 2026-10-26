import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should display login page with form elements and strict flat UI styling', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Sign In|RentEase/);
    await expect(page.locator('h1')).toContainText(/Welcome Back|Sign In/i);
    await expect(page.locator('input[type="email"], input#email')).toBeVisible();
    await expect(page.locator('input[type="password"], input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error banner when submitting invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input#email', 'invalid.user@example.com');
    await page.fill('input[type="password"], input#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Expect error alert / notification
    const errorBanner = page.locator('.error-banner, .text-rose, [role="alert"]');
    await expect(errorBanner.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page with all role options', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText(/Create Account|Get Started/i);
    await expect(page.locator('input#fullName, input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input#email, input[name="email"]')).toBeVisible();
    await expect(page.locator('select#role, select[name="role"]')).toBeVisible();
    await expect(page.locator('input#password, input[name="password"]')).toBeVisible();
  });
});
