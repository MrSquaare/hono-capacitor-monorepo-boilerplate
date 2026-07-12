import { DummyServiceMock } from "../services/dummy.mock";

import { createMiddleware } from "hono/factory";
import { vi } from "vitest";

import { dummyServiceMiddleware } from "./dummy";

vi.mock("./dummy", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./dummy")>();

  return {
    ...mod,
    dummyServiceMiddleware: vi.fn().mockImplementation(
      createMiddleware(async (c, next) => {
        c.set("dummyService", DummyServiceMock);
        await next();
      }),
    ),
  };
});

export const mockedDummyServiceMiddleware = vi.mocked(dummyServiceMiddleware);
