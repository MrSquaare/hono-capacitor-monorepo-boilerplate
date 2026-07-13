import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.beforeEach(async ({ page }) => {
    await page.routeWebSocket("**/parties/dummies/*", () => {});
  });

  test.describe("Read", () => {
    test("opens details", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name: "Alice" }],
          status: 200,
        });
      });

      await page.route("**/dummies/*", async (route) => {
        await route.fulfill({
          json: { age: 25, id: 1, name: "Alice" },
          status: 200,
        });
      });

      await page.goto("/");
      await page.getByRole("button", { name: "View" }).click();

      await expect(page.locator("text=Dummy Details")).toBeVisible();
      await expect(
        page.locator('role=dialog[name="Dummy Details"]').locator("text=Alice"),
      ).toBeVisible();
    });

    test("displays server error on load details", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name: "Alice" }],
          status: 200,
        });
      });

      await page.route("**/dummies/*", async (route) => {
        await route.fulfill({
          json: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to load dummy",
          },
          status: 500,
        });
      });

      await page.goto("/?detail=1");

      await expect(
        page.locator("text=Failed to load dummy").first(),
      ).toBeVisible();
    });

    test("closes details on escape key", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name: "Alice" }],
          status: 200,
        });
      });

      await page.route("**/dummies/*", async (route) => {
        await route.fulfill({
          json: { age: 25, id: 1, name: "Alice" },
          status: 200,
        });
      });

      await page.goto("/?detail=1");

      const modal = page.locator('role=dialog[name="Dummy Details"]');

      await expect(modal).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
      expect(page.url()).not.toContain("detail=");
    });
  });
});
