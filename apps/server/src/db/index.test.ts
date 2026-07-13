import { mockedDrizzle } from "../test/drizzle-orm-d1.mock";

import { describe, expect, it } from "vitest";

import type { DB } from "./index";

import { getDB } from "./index";
import { relations } from "./relations";

describe("getDB", () => {
  it("initializes Drizzle DB with D1 binding and relations", () => {
    const mockedD1 = {} as D1Database;
    const mockedEnv = { DB: mockedD1 } as CloudflareBindings;
    const mockedDB = {} as DB;

    mockedDrizzle.mockReturnValueOnce(mockedDB);

    const result = getDB(mockedEnv);

    expect(result).toEqual(mockedDB);

    expect(mockedDrizzle).toHaveBeenCalledTimes(1);
    expect(mockedDrizzle).toHaveBeenNthCalledWith(1, mockedD1, { relations });
  });
});
