import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.describe("Create", () => {
    test("opens create form", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({ json: [], status: 200 });
      });

      await page.goto("/");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(
        page.locator('role=dialog[name="Create Dummy"]'),
      ).toBeVisible();
    });

    test("closes create form on escape key", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({ json: [], status: 200 });
      });

      await page.goto("/");
      await page.getByRole("button", { name: "Create" }).click();

      const modal = page.locator('role=dialog[name="Create Dummy"]');

      await expect(modal).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    });

    test("creates a dummy", async ({ page }) => {
      let dummiesCount = 0;

      await page.route("**/dummies", async (route) => {
        const method = route.request().method();

        if (method === "GET") {
          if (dummiesCount === 0) {
            await route.fulfill({ json: [], status: 200 });
          } else {
            await route.fulfill({
              json: [{ age: 25, id: 1, name: "Alice" }],
              status: 200,
            });
          }
        } else if (method === "POST") {
          dummiesCount = 1;

          await route.fulfill({
            json: { age: 25, id: 1, name: "Alice" },
            status: 201,
          });
        }
      });

      await page.goto("/?create=true");

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("25");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(
        page.locator("text=Dummy created successfully"),
      ).toBeVisible();
      await expect(page.locator("text=Alice")).toBeVisible();
    });

    test("displays validation errors on create", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({ json: [], status: 200 });
      });

      await page.goto("/?create=true");

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("-5");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(
        page.locator("text=Age must be a positive number"),
      ).toBeVisible();
    });

    test("displays server validation errors on create", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        if (route.request().method() === "POST") {
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
        } else {
          await route.fulfill({ json: [], status: 200 });
        }
      });

      await page.goto("/?create=true");

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("25");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(page.locator("text=Name is already taken")).toBeVisible();
    });

    test("displays server error on create", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            json: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save dummy",
            },
            status: 500,
          });
        } else {
          await route.fulfill({ json: [], status: 200 });
        }
      });

      await page.goto("/?create=true");

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("25");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(page.locator("text=Failed to create dummy")).toBeVisible();
    });

    test("displays fallback unexpected error on create", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            json: { notAnErrorSchemaField: true },
            status: 500,
          });
        } else {
          await route.fulfill({ json: [], status: 200 });
        }
      });

      await page.goto("/?create=true");

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("25");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(page.locator("text=Failed to create dummy")).toBeVisible();
    });

    test("displays unknown submission error on create", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({ json: [], status: 200 });
      });

      await page.goto("/?create=true");

      await page.evaluate(() => {
        window.fetch = () => Promise.reject("raw string error");
      });

      await page.getByLabel("Name").fill("Alice");
      await page.getByLabel("Age").fill("25");
      await page.getByRole("button", { name: "Create" }).click();

      await expect(page.locator("text=Failed to create dummy")).toBeVisible();
    });
  });
});
