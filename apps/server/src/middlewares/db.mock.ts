import { createMiddleware } from "hono/factory";
import { vi } from "vitest";

import { dbMiddleware } from "./db";

vi.mock("./db", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./db")>();

  return {
    ...mod,
    dbMiddleware: vi.fn().mockImplementation(
      createMiddleware(async (c, next) => {
        await next();
      }),
    ),
  };
});

export const mockedDBMiddleware = vi.mocked(dbMiddleware);
