import { mockedErrorHandler } from "./middlewares/error-handler.mock";
import { mockedDummiesApp } from "./routes/dummies.mock";
import { mockedCors } from "./test/hono-cors.mock";
import { mockedPartyServerMiddleware } from "./test/hono-party.mock";
import { onErrorSpy, routeSpy, useSpy } from "./test/hono.mock";

import "./index";
import { describe, expect, it } from "vitest";

describe("app", () => {
  describe("initialization", () => {
    it("setup up middlewares and routes", async () => {
      expect(useSpy).toHaveBeenCalledTimes(2);
      expect(routeSpy).toHaveBeenCalledTimes(1);
      expect(onErrorSpy).toHaveBeenCalledTimes(1);
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
      expect(onErrorSpy).toHaveBeenNthCalledWith(1, mockedErrorHandler);
    });
  });
});
