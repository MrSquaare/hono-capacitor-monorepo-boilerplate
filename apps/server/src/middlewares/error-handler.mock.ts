import type { ErrorHandler } from "hono";

import { vi } from "vitest";

import { errorHandler } from "./error-handler";

vi.mock("./error-handler", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./error-handler")>();

  return {
    ...mod,
    errorHandler: vi.fn<ErrorHandler>().mockImplementation((error, c) => {
      return c.json({ message: "Mocked error handler" }, 500);
    }),
  };
});

export const mockedErrorHandler = vi.mocked(errorHandler);
