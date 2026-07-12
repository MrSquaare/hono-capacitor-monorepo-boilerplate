import { expect, test } from "../test";

test.describe("Dummies", () => {
  test.describe("Sync", () => {
    test("syncs on WS event", async ({ page }) => {
      let refetchCalled = false;

      await page.route("**/dummies", async (route) => {
        if (refetchCalled) {
          await route.fulfill({
            json: [{ age: 25, id: 1, name: "Alice" }],
            status: 200,
          });
        } else {
          await route.fulfill({ json: [], status: 200 });

          refetchCalled = true;
        }
      });

      await page.routeWebSocket("**/parties/dummies/*", (ws) => {
        setTimeout(() => {
          ws.send(JSON.stringify({ type: "DUMMY_CREATED" }));
        }, 500);
      });

      await page.goto("/");

      await expect(
        page.locator("text=No dummies yet. Create one!"),
      ).toBeVisible();
      await expect(page.locator("text=Alice")).toBeVisible();
    });

    test("handles WS parse error gracefully", async ({ page }) => {
      await page.route("**/dummies", async (route) => {
        await route.fulfill({ json: [], status: 200 });
      });

      await page.routeWebSocket("**/parties/dummies/*", (ws) => {
        setTimeout(() => {
          ws.send("invalid-json-payload");
        }, 500);
      });

      await page.goto("/");
      await page.waitForTimeout(1000);
    });
  });
});
