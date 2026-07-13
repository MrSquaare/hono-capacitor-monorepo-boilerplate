import { test as base } from "@playwright/test";
import fs from "fs";
import path from "path";

export const test = base.extend<{ coverage: void }>({
  coverage: [
    async ({ page }, use, testInfo) => {
      page.on("console", (consoleMessage) => {
        if (consoleMessage.type() === "error") {
          console.error(`[Browser] [Console Error] ${consoleMessage.text()}`);
        }
      });
      page.on("pageerror", (exception) => {
        console.error(
          `[Browser] [Page Error] ${exception.stack || exception.message}`,
        );
      });

      await use();

      if (process.env.VITE_COVERAGE === "true") {
        try {
          const coverage = await page.evaluate(
            () => (window as { __coverage__?: unknown }).__coverage__,
          );

          if (coverage) {
            const nycDir = path.join(process.cwd(), ".nyc_output/");
            const filename = `${testInfo.testId}-${testInfo.project.name}.json`;

            fs.mkdirSync(nycDir, { recursive: true });
            fs.writeFileSync(
              path.join(nycDir, filename),
              JSON.stringify(coverage),
            );
          }
        } catch {
          // Do nothing
        }
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
