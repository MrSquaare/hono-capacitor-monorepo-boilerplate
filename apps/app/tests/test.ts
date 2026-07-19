import { test as base } from "@playwright/test";

import { collectRawCoverage } from "./coverage";
import { logErrors } from "./log";

export const test = base.extend<{ coverage: void }>({
  coverage: [
    async ({ page }, use, testInfo) => {
      logErrors(page);

      await use();

      await collectRawCoverage(testInfo, page);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
