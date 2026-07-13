import { type Mocked, vi } from "vitest";

import { DummyService } from "./dummy";

export const DummyServiceMock = {
  create: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
} as unknown as Mocked<DummyService>;

vi.mock("./dummy", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./dummy")>();

  return {
    ...mod,
    DummyService: vi.fn().mockImplementation(function () {
      return DummyServiceMock;
    }),
  };
});

export const MockedDummyService = vi.mocked(DummyService);
