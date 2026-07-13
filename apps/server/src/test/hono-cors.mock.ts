import { cors } from "hono/cors";
import { vi } from "vitest";

vi.mock("hono/cors", async (importOriginal) => {
  const mod = await importOriginal<typeof import("hono/cors")>();

  return {
    ...mod,
    cors: vi.fn(),
  };
});

export const mockedCors = vi.mocked(cors);
