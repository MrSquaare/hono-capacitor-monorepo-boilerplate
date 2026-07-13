import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.beforeEach(async ({ page }) => {
    await page.routeWebSocket("**/parties/dummies/*", () => {});
  });

  test.describe("List", () => {
    test("displays empty list", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [],
          status: 200,
        });
      });

      await page.goto("/");

      await expect(
        page.locator("text=No dummies yet. Create one!"),
      ).toBeVisible();
    });

    test("displays populated list", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [
            { age: 25, id: 1, name: "Alice" },
            { age: 30, id: 2, name: "Bob" },
          ],
          status: 200,
        });
      });

      await page.goto("/");

      await expect(page.locator("text=Alice")).toBeVisible();
      await expect(page.locator("text=Bob")).toBeVisible();
    });

    test("performs pull to refresh", async ({ page }) => {
      let refetchCalled = false;

      await page.route("**/dummies", async (route) => {
        await route.fulfill({
          json: [{ age: 25, id: 1, name: "Alice" }],
          status: 200,
        });

        refetchCalled = true;
      });

      await page.goto("/");
      await expect(page.locator("text=Alice")).toBeVisible();

      refetchCalled = false;

      await page.evaluate(() => {
        const el = document.querySelector("svg")?.parentElement?.parentElement;

        if (el) {
          const startEvent = new CustomEvent("touchstart", {
            bubbles: true,
            cancelable: true,
          });

          Object.defineProperty(startEvent, "touches", {
            value: [{ clientX: 100, clientY: 100, pageX: 100, pageY: 100 }],
          });
          el.dispatchEvent(startEvent);

          const moveEvent = new CustomEvent("touchmove", {
            bubbles: true,
            cancelable: true,
          });

          Object.defineProperty(moveEvent, "touches", {
            value: [{ clientX: 100, clientY: 350, pageX: 100, pageY: 350 }],
          });
          el.dispatchEvent(moveEvent);

          const endEvent = new CustomEvent("touchend", {
            bubbles: true,
            cancelable: true,
          });

          Object.defineProperty(endEvent, "touches", {
            value: [],
          });
          el.dispatchEvent(endEvent);
        }
      });

      await expect.poll(() => refetchCalled).toBe(true);
      await page.waitForTimeout(500);
    });
  });
});
