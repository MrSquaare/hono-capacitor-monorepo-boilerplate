import type { Context, Env, Next } from "hono";
import type { Mock, Mocked } from "vitest";

import { vi } from "vitest";

export type MockedContext<E extends Env> = Mocked<Omit<Context<E>, "json">> & {
  json: Mock;
};

export const createMockedContext = <E extends Env>(options?: {
  envs?: Partial<E["Bindings"]>;
  vars?: Partial<E["Variables"]>;
}): MockedContext<E> => {
  const envs = options?.envs ?? {};
  const vars = options?.vars ?? {};

  const getSpy = vi.fn<Context["get"]>().mockImplementation((key) => vars[key]);
  const setSpy = vi.fn<Context["set"]>().mockImplementation((key, value) => {
    vars[key] = value;
  });
  const jsonSpy = vi.fn();

  const context = {
    env: envs,
    get: getSpy,
    json: jsonSpy,
    set: setSpy,
    var: vars,
  };

  return context as unknown as MockedContext<E>;
};

export const createMockedNext = () => {
  return vi.fn<Next>();
};
