import { DummyServiceMock, MockedDummyService } from "../services/dummy.mock";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { DB } from "../db";

import { createMockedDrizzleD1DB } from "../test/drizzle-orm-d1.fixture";
import { createMockedContext, createMockedNext } from "../test/hono.fixture";
import {
  dummyServiceMiddleware,
  type DummyServiceMiddlewareEnv,
} from "./dummy";

describe("dummyServiceMiddleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates immediately if dummyService is already set in context variables", async () => {
    const mockedContext = createMockedContext<DummyServiceMiddlewareEnv>({
      vars: {
        dummyService: DummyServiceMock,
      },
    });
    const mockedNext = createMockedNext();

    await dummyServiceMiddleware(mockedContext, mockedNext);

    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenNthCalledWith(1);

    expect(MockedDummyService).not.toHaveBeenCalled();
  });

  it("throws an error if DB is not found in context", async () => {
    const mockedContext = createMockedContext<DummyServiceMiddlewareEnv>({});
    const mockedNext = createMockedNext();

    await expect(
      dummyServiceMiddleware(mockedContext, mockedNext),
    ).rejects.toThrow("DB not found in context");

    expect(mockedNext).not.toHaveBeenCalled();
  });

  it("initializes DummyService and stores it in context if not already present", async () => {
    const mockedDB = createMockedDrizzleD1DB<DB>();
    const mockedContext = createMockedContext<DummyServiceMiddlewareEnv>({
      vars: {
        DB: mockedDB,
      },
    });
    const mockedNext = createMockedNext();

    await dummyServiceMiddleware(mockedContext, mockedNext);

    expect(mockedContext.get).toHaveBeenCalledTimes(1);
    expect(mockedContext.get).toHaveBeenNthCalledWith(1, "DB");

    expect(MockedDummyService).toHaveBeenCalledTimes(1);
    expect(MockedDummyService).toHaveBeenNthCalledWith(1, mockedDB);

    expect(mockedContext.set).toHaveBeenCalledTimes(1);
    expect(mockedContext.set).toHaveBeenNthCalledWith(
      1,
      "dummyService",
      MockedDummyService.mock.instances[0],
    );

    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect(mockedNext).toHaveBeenNthCalledWith(1);
  });
});
