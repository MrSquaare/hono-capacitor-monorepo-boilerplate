import type { Page, TestInfo } from "@playwright/test";

import fs from "fs";
import path from "path";

export const getCoverageTempDir = () => {
  return path.join(process.cwd(), "coverage/e2e/temp/");
};

export const createCoverageTempDir = () => {
  const coverageDir = getCoverageTempDir();

  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  return coverageDir;
};

export const writeRawCoverageFile = (filename: string, coverage: unknown) => {
  const coverageDir = createCoverageTempDir();
  const filePath = path.join(coverageDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(coverage));
};

export const collectRawCoverage = async (testInfo: TestInfo, page: Page) => {
  if (process.env.VITE_COVERAGE !== "true") {
    return;
  }

  try {
    const coverage = await page.evaluate(
      () => (window as { __coverage__?: unknown }).__coverage__,
    );

    if (!coverage) {
      throw new Error("window.__coverage__ is undefined or missing");
    }

    const filename = `${testInfo.testId}-${testInfo.project.name}.json`;

    writeRawCoverageFile(filename, coverage);
  } catch (error) {
    console.error("Error collecting raw coverage:", error);

    throw error;
  }
};
