import { Hono } from "hono";
import { vi } from "vitest";

import { dummiesApp } from "./dummies";

vi.mock("./dummies", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./dummies")>();

  return {
    ...mod,
    dummiesApp: new Hono(),
  };
});

export const mockedDummiesApp = vi.mocked(dummiesApp);
