import type { Hono } from "hono";

import { type Mock, vi } from "vitest";

export let useSpy: Mock<typeof Hono.prototype.use>;
export let routeSpy: Mock<typeof Hono.prototype.route>;
export let onErrorSpy: Mock<typeof Hono.prototype.onError>;

vi.mock("hono", async (importOriginal) => {
  const actual = await importOriginal<typeof import("hono")>();

  class SpiedHono extends actual.Hono {
    constructor(...args: ConstructorParameters<typeof actual.Hono>) {
      super(...args);

      const originalUse = this.use.bind(this);
      useSpy = vi.fn((...useArgs: Parameters<typeof originalUse>) =>
        originalUse(...useArgs),
      );
      this.use = useSpy as unknown as typeof this.use;

      const originalRoute = this.route.bind(this);
      routeSpy = vi.fn((...routeArgs: Parameters<typeof originalRoute>) =>
        originalRoute(...routeArgs),
      );
      this.route = routeSpy as unknown as typeof this.route;

      const originalOnError = this.onError.bind(this);
      onErrorSpy = vi.fn((...onErrorArgs: Parameters<typeof originalOnError>) =>
        originalOnError(...onErrorArgs),
      );
      this.onError = onErrorSpy as unknown as typeof this.onError;
    }
  }

  return { ...actual, Hono: SpiedHono };
});
