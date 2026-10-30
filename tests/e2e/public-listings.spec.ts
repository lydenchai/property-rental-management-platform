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

  test('should render properties catalog with search inputs and property cards', async ({
    page,
  }) => {
    await page.goto('/properties');

    await expect(page.locator('h1')).toContainText(/Browse Properties|Available Listings/i);

    // Verify search filter inputs
    const searchInput = page.locator('input[placeholder*="Search"], input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verify property card grid exists
    const propertyGrid = page.locator('.property-grid, .properties-list, .grid');
    await expect(propertyGrid.first()).toBeVisible();
  });

  test('should allow user to fill home page filter card and navigate with pre-filled filters', async ({
    page,
  }) => {
    await page.goto('/');

    // Verify hero filter card exists
    const filterCard = page.locator('form:has(button[type="submit"])').first();
    await expect(filterCard).toBeVisible();

    // Select city
    const citySelect = filterCard.locator('select').first();
    await citySelect.selectOption('Phnom Penh');

    // Submit search
    const submitBtn = filterCard.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Verify navigation to /properties with city query parameter
    await page.waitForURL(/\/properties/);
    expect(page.url()).toContain('city=Phnom+Penh');
  });
});
