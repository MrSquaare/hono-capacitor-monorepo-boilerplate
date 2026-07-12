import { createMiddleware } from "hono/factory";

import type { DBMiddlewareVariables } from "../middlewares/db";

import { DummyService } from "../services/dummy";

export type DummyServiceMiddlewareEnv = {
  Bindings: CloudflareBindings;
  Variables: DBMiddlewareVariables & DummyServiceMiddlewareVariables;
};

export type DummyServiceMiddlewareVariables = {
  dummyService: DummyService;
};

export const dummyServiceMiddleware =
  createMiddleware<DummyServiceMiddlewareEnv>(async (c, next) => {
    if (c.var.dummyService) return await next();

    const db = c.get("DB");

    if (!db) throw new Error("DB not found in context");

    c.set("dummyService", new DummyService(db));

    await next();
  });
