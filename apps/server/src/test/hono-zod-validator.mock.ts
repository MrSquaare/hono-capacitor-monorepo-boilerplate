import { zValidator } from "@hono/zod-validator";
import { vi } from "vitest";

vi.mock("@hono/zod-validator", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@hono/zod-validator")>();

  return {
    ...mod,
    zValidator: vi.fn(),
  };
});

export const mockedZValidator = vi.mocked(zValidator);
