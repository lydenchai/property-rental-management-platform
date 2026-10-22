import { test, expect } from '@playwright/test';

test.describe('Public Property Listings & Browsing', () => {
  test('should display landing homepage with brand and call-to-actions', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/RentEase/);
    await expect(page.locator('.brand-name')).toContainText(/RentEase/i);
    
    // Check navigation links
    const browseLink = page.locator('a[href="/properties"]');
    await expect(browseLink.first()).toBeVisible();
  });

  test('should render properties catalog with search inputs and property cards', async ({ page }) => {
    await page.goto('/properties');

    await expect(page.locator('h1')).toContainText(/Browse Properties|Available Listings/i);
    
    // Verify search filter inputs
    const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verify property card grid exists
    const propertyGrid = page.locator('.property-grid, .properties-list, .grid');
    await expect(propertyGrid.first()).toBeVisible();
  });
});
