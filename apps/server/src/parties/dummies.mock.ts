import { vi } from "vitest";

import { DummiesParty } from "./dummies";

vi.mock("./dummies", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./dummies")>();

  return {
    ...mod,
    DummiesParty: vi.fn(),
  };
});

export const MockedDummiesParty = vi.mocked(DummiesParty);
