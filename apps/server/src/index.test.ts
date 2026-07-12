import { mockedDummiesApp } from "./routes/dummies.mock";
import { mockedCors } from "./test/hono-cors.mock";
import { mockedPartyServerMiddleware } from "./test/hono-party.mock";
import { routeSpy, useSpy } from "./test/hono.mock";

import { APIErrorCode } from "@projectname/shared/schemas";
import { afterEach, describe, expect, it, vi } from "vitest";

import app from "./index";
import { createMockedContext } from "./test/hono.fixture";

describe("app", () => {
  describe("initialization", () => {
    it("setup up middlewares and routes", async () => {
      expect(useSpy).toHaveBeenCalledTimes(2);
      expect(routeSpy).toHaveBeenCalledTimes(1);
      expect(useSpy).toHaveBeenNthCalledWith(
        1,
        mockedCors.mock.results[0]?.value,
      );
      expect(routeSpy).toHaveBeenNthCalledWith(1, "/dummies", mockedDummiesApp);
      expect(useSpy).toHaveBeenNthCalledWith(
        2,
        "/parties/*",
        mockedPartyServerMiddleware.mock.results[0]?.value,
      );
    });
  });

  describe("onError", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("logs the error and returns 500 with the error message when present", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockReturnValueOnce(undefined);
      const mockJsonResponse = {} as Response;
      const mockedContext = createMockedContext();
      const error = new Error("Something went wrong");

      mockedContext.json.mockReturnValueOnce(mockJsonResponse);

      const result = app["errorHandler"](error, mockedContext);

      expect(result).toBe(mockJsonResponse);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockedContext.json).toHaveBeenCalledWith(
        {
          code: APIErrorCode.INTERNAL_SERVER_ERROR,
          message: "Something went wrong",
        },
        500,
      );
    });

    it("falls back to a generic message when the error has none", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockReturnValueOnce(undefined);
      const mockJsonResponse = {} as Response;
      const mockedContext = createMockedContext();
      const error = new Error();

      mockedContext.json.mockReturnValueOnce(mockJsonResponse);

      const result = app["errorHandler"](error, mockedContext);

      expect(result).toBe(mockJsonResponse);
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
});
