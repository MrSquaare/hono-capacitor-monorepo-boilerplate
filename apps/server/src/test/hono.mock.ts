import { vi } from "vitest";

vi.mock("hono", async (importOriginal) => {
  const actual = await importOriginal<typeof import("hono")>();

  class SpiedHono extends actual.Hono {
    constructor(...args: ConstructorParameters<typeof actual.Hono>) {
      super(...args);

      const originalUse = this.use.bind(this);
      const instanceUseSpy = vi.fn(
        (...useArgs: Parameters<typeof originalUse>) => originalUse(...useArgs),
      );
      this.use = instanceUseSpy as unknown as typeof this.use;

      const originalRoute = this.route.bind(this);
      const instanceRouteSpy = vi.fn(
        (...routeArgs: Parameters<typeof originalRoute>) =>
          originalRoute(...routeArgs),
      );
      this.route = instanceRouteSpy as unknown as typeof this.route;

      const originalOnError = this.onError.bind(this);
      const instanceOnErrorSpy = vi.fn(
        (...onErrorArgs: Parameters<typeof originalOnError>) =>
          originalOnError(...onErrorArgs),
      );
      this.onError = instanceOnErrorSpy as unknown as typeof this.onError;
    }
  }

  return { ...actual, Hono: SpiedHono };
});
