import { defineRelations } from "drizzle-orm";
import { vi } from "vitest";

vi.mock("drizzle-orm", async (importOriginal) => {
  const mod = await importOriginal<typeof import("drizzle-orm")>();

  return {
    ...mod,
    defineRelations: vi.fn(),
  };
});

export const mockedDefineRelations = vi.mocked(defineRelations);
