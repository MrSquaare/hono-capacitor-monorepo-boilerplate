import "./test/hono.mock";
import { mockedErrorHandler } from "./middlewares/error-handler.mock";
import { mockedDummiesApp } from "./routes/dummies.mock";
import { mockedCors } from "./test/hono-cors.mock";
import { mockedPartyServerMiddleware } from "./test/hono-party.mock";

import { describe, expect, it } from "vitest";

import app from "./index";

describe("app", () => {
  describe("initialization", () => {
    it("setup up middlewares and routes", async () => {
      expect(app.use).toHaveBeenCalledTimes(2);
      expect(app.route).toHaveBeenCalledTimes(1);
      expect(app.onError).toHaveBeenCalledTimes(1);
      expect(app.use).toHaveBeenNthCalledWith(
        1,
        mockedCors.mock.results[0]?.value,
      );
      expect(app.route).toHaveBeenNthCalledWith(
        1,
        "/dummies",
        mockedDummiesApp,
      );
      expect(app.use).toHaveBeenNthCalledWith(
        2,
        "/parties/*",
        mockedPartyServerMiddleware.mock.results[0]?.value,
      );
      expect(app.onError).toHaveBeenNthCalledWith(1, mockedErrorHandler);
    });
  });
});
