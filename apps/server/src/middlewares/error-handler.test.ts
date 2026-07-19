import type { ContentfulStatusCode } from "hono/utils/http-status";

import { APIErrorCode } from "@projectname/shared/schemas";
import { HTTPException } from "hono/http-exception";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockedContext } from "../test/hono.fixture";
import { errorHandler } from "./error-handler";

describe("errorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns detailed message and correct code when error is a non-5xx HTTPException", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockReturnValueOnce(undefined);
    const mockedResponse = {} as Response;
    const mockedContext = createMockedContext();
    const error = new HTTPException(404, { message: "Not found detail" });

    mockedContext.json.mockReturnValueOnce(mockedResponse);

    const result = errorHandler(error, mockedContext);

    expect(result).toBe(mockedResponse);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(mockedContext.json).toHaveBeenCalledWith(
      {
        code: APIErrorCode.NOT_FOUND,
        message: "Not found detail",
      },
      404,
    );
  });

  it("returns detailed message and unknown code when error is an unknown non-5xx HTTPException", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockReturnValueOnce(undefined);
    const mockedResponse = {} as Response;
    const mockedContext = createMockedContext();
    const error = new HTTPException(432 as ContentfulStatusCode, {
      message: "432 detail",
    });

    mockedContext.json.mockReturnValueOnce(mockedResponse);

    const result = errorHandler(error, mockedContext);

    expect(result).toBe(mockedResponse);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(mockedContext.json).toHaveBeenCalledWith(
      {
        code: APIErrorCode.UNKNOWN_ERROR,
        message: "432 detail",
      },
      432,
    );
  });

  it("returns an internal error when error is a 5xx HTTPException", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockReturnValueOnce(undefined);
    const mockedResponse = {} as Response;
    const mockedContext = createMockedContext();
    const error = new HTTPException(500, { message: "Sensitive detail" });

    mockedContext.json.mockReturnValueOnce(mockedResponse);

    const result = errorHandler(error, mockedContext);

    expect(result).toBe(mockedResponse);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(mockedContext.json).toHaveBeenCalledWith(
      {
        code: APIErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      },
      500,
    );
  });

  it("returns an internal error when error is not an HTTPException", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockReturnValueOnce(undefined);
    const mockedResponse = {} as Response;
    const mockedContext = createMockedContext();
    const error = new Error("Sensitive detail");

    mockedContext.json.mockReturnValueOnce(mockedResponse);

    const result = errorHandler(error, mockedContext);

    expect(result).toBe(mockedResponse);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(mockedContext.json).toHaveBeenCalledWith(
      {
        code: APIErrorCode.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error",
      },
      500,
    );
  });
});
