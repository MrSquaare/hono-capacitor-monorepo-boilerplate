import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.describe("Update", () => {
    test("opens edit form", async ({ page }) => {
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
      await page.getByRole("button", { name: "Edit" }).click();

      await expect(
        page.locator('role=dialog[name="Edit Dummy"]'),
      ).toBeVisible();
    });

    test("closes edit form on escape key", async ({ page }) => {
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
      await page.getByRole("button", { name: "Edit" }).click();

      const modal = page.locator('role=dialog[name="Edit Dummy"]');

      await expect(modal).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    });

    test("updates a dummy", async ({ page }) => {
      let name = "Alice";

      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name }],
          status: 200,
        });
      });

      await page.route("**/dummies/*", async (route) => {
        const method = route.request().method();

        if (method === "GET") {
          await route.fulfill({
            json: { age: 25, id: 1, name },
            status: 200,
          });
        } else if (method === "PUT") {
          name = "Alice Updated";

          await route.fulfill({
            json: { age: 25, id: 1, name },
            status: 200,
          });
        }
      });

      await page.goto("/?edit=1");

      await page.getByLabel("Name").fill("Alice Updated");
      await page
        .locator('role=dialog[name="Edit Dummy"]')
        .getByRole("button", { exact: true, name: "Edit" })
        .click();

      await expect(
        page.locator("text=Dummy updated successfully"),
      ).toBeVisible();
    });

    test("displays validation errors on update", async ({ page }) => {
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

      await page.goto("/?edit=1");

      await page.getByLabel("Name").fill("");
      await page
        .locator('role=dialog[name="Edit Dummy"]')
        .getByRole("button", { exact: true, name: "Edit" })
        .click();

      await expect(page.locator("text=Name is required")).toBeVisible();
    });

    test("displays server validation errors on update", async ({ page }) => {
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
        } else if (method === "PUT") {
          await route.fulfill({
            json: {
              code: "VALIDATION_FAILED",
              fields: {
                name: ["Name is already taken"],
              },
              form: [],
              message: "Validation failed",
              target: "dummy",
            },
            status: 400,
          });
        }
      });

      await page.goto("/?edit=1");

      await page.getByLabel("Name").fill("Alice Updated");
      await page
        .locator('role=dialog[name="Edit Dummy"]')
        .getByRole("button", { exact: true, name: "Edit" })
        .click();

      await expect(page.locator("text=Name is already taken")).toBeVisible();
    });

    test("displays server error on update", async ({ page }) => {
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
        } else if (method === "PUT") {
          await route.fulfill({
            json: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update dummy",
            },
            status: 500,
          });
        }
      });

      await page.goto("/?edit=1");

      await page.getByLabel("Name").fill("Alice Updated");
      await page
        .locator('role=dialog[name="Edit Dummy"]')
        .getByRole("button", { exact: true, name: "Edit" })
        .click();

      await expect(page.locator("text=Failed to update dummy")).toBeVisible();
    });
  });
});
