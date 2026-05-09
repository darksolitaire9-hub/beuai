import { test, expect } from "@playwright/test";

test.describe("beuai smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the application and show the title", async ({ page }) => {
    // Check for the logo text "beuai"
    const logo = page.locator('span', { hasText: 'beuai' }).first();
    await expect(logo).toBeVisible();
  });

  test("should display the scan tab by default", async ({ page }) => {
    const scanTitle = page.locator('h2', { hasText: 'Rescue Receipt' }).first();
    await expect(scanTitle).toBeVisible();
  });

  test("should allow switching language to Portuguese", async ({ page }) => {
    // Open language picker
    await page.getByRole('button', { name: 'English' }).click();
    
    // Select Português
    await page.getByRole('menuitem', { name: 'Português' }).click();
    
    // Verify title changed
    const scanTitlePt = page.locator('h2', { hasText: 'Resgatar Recibo' }).first();
    await expect(scanTitlePt).toBeVisible();
  });

  test("should navigate to history tab", async ({ page }) => {
    // Click History tab in bottom nav (mobile) or sidebar
    // We'll target the button role
    await page.getByRole('tab', { name: 'History' }).click();
    
    // Verify history title
    const historyTitle = page.locator('h2', { hasText: 'History' }).first();
    await expect(historyTitle).toBeVisible();
    
    // Verify empty state
    await expect(page.getByText('Ready for rescue?')).toBeVisible();
  });
});
