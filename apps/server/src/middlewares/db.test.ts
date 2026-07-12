import { DBMock, mockedGetDB } from "../db/index.mock";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockedContext, createMockedNext } from "../test/hono.fixture";
import { dbMiddleware, type DBMiddlewareEnv } from "./db";

describe("dbMiddleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates immediately if DB is already set in context variables", async () => {
    const mockedContext = createMockedContext<DBMiddlewareEnv>({
      vars: {
        DB: DBMock,
      },
    });
    const mockedNext = createMockedNext();

    await dbMiddleware(mockedContext, mockedNext);

    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenNthCalledWith(1);

    expect(mockedGetDB).not.toHaveBeenCalled();
    expect(mockedContext.set).not.toHaveBeenCalled();
  });

  it("initializes db and stores it in context if not already present", async () => {
    const mockedD1 = {} as D1Database;
    const mockedContext = createMockedContext<DBMiddlewareEnv>({
      envs: {
        DB: mockedD1,
      },
    });
    const mockedNext = createMockedNext();

    await dbMiddleware(mockedContext, mockedNext);

    expect(mockedGetDB).toHaveBeenCalledTimes(1);
    expect(mockedGetDB).toHaveBeenNthCalledWith(1, mockedContext.env);

    expect(mockedContext.set).toHaveBeenCalledTimes(1);
    expect(mockedContext.set).toHaveBeenNthCalledWith(1, "DB", DBMock);

    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenNthCalledWith(1);
  });
});
