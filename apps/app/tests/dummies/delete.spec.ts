import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.describe("Delete", () => {
    test("opens delete confirmation", async ({ page }) => {
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
      await page.getByRole("button", { name: "Delete" }).click();

      await expect(
        page.locator('role=dialog[name="Delete Dummy"]'),
      ).toBeVisible();
    });

    test("closes delete confirmation on escape key", async ({ page }) => {
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
      await page.getByRole("button", { name: "Delete" }).click();

      const modal = page.locator('role=dialog[name="Delete Dummy"]');

      await expect(modal).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    });

    test("deletes a dummy", async ({ page }) => {
      let deleted = false;

      await page.route("**/dummies", async (route) => {
        if (deleted) {
          await route.fulfill({ json: [], status: 200 });
        } else {
          await route.fulfill({
            json: [{ age: 25, id: 1, name: "Alice" }],
            status: 200,
          });
        }
      });

      await page.route("**/dummies/*", async (route) => {
        const method = route.request().method();

        if (method === "GET") {
          await route.fulfill({
            json: { age: 25, id: 1, name: "Alice" },
            status: 200,
          });
        } else if (method === "DELETE") {
          deleted = true;

          await route.fulfill({
            json: { age: 25, id: 1, name: "Alice" },
            status: 200,
          });
        }
      });

      await page.goto("/?delete=1");

      await page
        .locator('role=dialog[name="Delete Dummy"]')
        .getByRole("button", { exact: true, name: "Delete" })
        .click();

      await expect(
        page.locator("text=Dummy deleted successfully"),
      ).toBeVisible();
    });

    test("displays server error on delete", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name: "Alice" }],
          status: 200,
        });
      });

      await page.route("**/dummies/*", async (route) => {
        const method = route.request().method();

        if (method === "GET") {
          await route.fulfill({
            json: { age: 25, id: 1, name: "Alice" },
            status: 200,
          });
        } else if (method === "DELETE") {
          await route.fulfill({
            json: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to delete dummy",
            },
            status: 500,
          });
        }
      });

      await page.goto("/?delete=1");

      await page
        .locator('role=dialog[name="Delete Dummy"]')
        .getByRole("button", { exact: true, name: "Delete" })
        .click();

      await expect(page.locator("text=Failed to delete dummy")).toBeVisible();
    });
  });
});
