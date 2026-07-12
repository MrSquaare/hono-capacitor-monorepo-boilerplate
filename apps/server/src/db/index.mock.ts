import { vi } from "vitest";

import { createMockedDrizzleD1DB } from "../test/drizzle-orm-d1.fixture";
import { type DB, getDB } from "./index";

export const DBMock = createMockedDrizzleD1DB<DB>();

vi.mock("./index", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./index")>();

  return {
    ...mod,
    getDB: vi.fn().mockImplementation(() => DBMock),
  };
});

export const mockedGetDB = vi.mocked(getDB);
