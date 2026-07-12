import { drizzle } from "drizzle-orm/d1";
import { vi } from "vitest";

vi.mock("drizzle-orm/d1", async (importOriginal) => {
  const mod = await importOriginal<typeof import("drizzle-orm/d1")>();

  return {
    ...mod,
    drizzle: vi.fn(),
  };
});

export const mockedDrizzle = vi.mocked(drizzle);
