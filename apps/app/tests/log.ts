import type { Page } from "@playwright/test";

export const logErrors = (page: Page) => {
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
};
