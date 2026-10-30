import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport & Navigation Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should render mobile header with hamburger menu and toggle drawer', async ({ page }) => {
    await page.goto('/');

    // Check brand logo and title visibility
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('header a[href="/"]')).toBeVisible();

    // Verify desktop navigation links are hidden on mobile
    const desktopNav = page.locator('header nav.hidden.md\\:flex');
    await expect(desktopNav).toBeHidden();

    // Verify mobile hamburger menu toggle is visible
    const hamburgerBtn = page.locator('header button[aria-label="Toggle navigation menu"]');
    await expect(hamburgerBtn).toBeVisible();

    // Open mobile navigation menu
    await hamburgerBtn.click();

    // Verify mobile navigation drawer is visible with links
    const mobilePropertiesLink = page.locator('header div.md\\:hidden a[href="/properties"]');
    await expect(mobilePropertiesLink).toBeVisible();

    // Close mobile navigation menu
    await hamburgerBtn.click();
    await expect(mobilePropertiesLink).toBeHidden();
  });

  test('should render properties page with responsive filters and view mode switches on mobile', async ({
    page,
  }) => {
    await page.goto('/properties');

    // Title and search input should be visible without horizontal page overflow
    await expect(page.locator('h1')).toBeVisible();
    const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verify view mode switcher buttons
    const gridBtn = page.locator('button[title*="Cards"], button[title*="Grid"]').first();
    const mapBtn = page.locator('button[title*="Map"]').first();

    await expect(gridBtn).toBeVisible();
    await expect(mapBtn).toBeVisible();

    // Switch to Map view on mobile
    await mapBtn.click();
    const mapCanvas = page.locator('.properties-map-explorer, .maplibre-container').first();
    await expect(mapCanvas).toBeVisible();
  });

  test('should display responsive login page on mobile without layout breakage', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
