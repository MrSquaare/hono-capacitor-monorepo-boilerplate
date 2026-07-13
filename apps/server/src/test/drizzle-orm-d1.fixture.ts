import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Mock, Mocked } from "vitest";

import { vi } from "vitest";

export type MockedDrizzleD1DBExtensions = {
  findFirst: Mock;
  findMany: Mock;
  returning: Mock;
  set: Mock;
  values: Mock;
  where: Mock;
};

export type MockedDrizzleDB1DB<T extends DrizzleD1Database> = Mocked<T> &
  MockedDrizzleD1DBExtensions;

export const createMockedDrizzleD1DB = <
  T extends DrizzleD1Database,
>(): MockedDrizzleDB1DB<T> => {
  const spyCache = new Map<string | symbol, unknown>();

  const handler: ProxyHandler<object> = {
    apply(target, thisArg, argArray) {
      return (target as (...args: unknown[]) => unknown).apply(
        thisArg,
        argArray,
      );
    },

    get(target, prop, receiver) {
      if (prop === "then") {
        return undefined;
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      if (spyCache.has(prop)) {
        return spyCache.get(prop);
      }

      const nestedMock = vi.fn();
      const nestedProxy = new Proxy(nestedMock, handler);

      nestedMock.mockImplementation(() => rootProxy);

      spyCache.set(prop, nestedProxy);

      return nestedProxy;
    },
  };

  const rootMock = vi.fn();
  const rootProxy = new Proxy(rootMock, handler);

  return rootProxy as unknown as MockedDrizzleDB1DB<T>;
};
