import { createMiddleware } from "hono/factory";

import { type DB, getDB } from "../db";

export type DBMiddlewareEnv = {
  Bindings: CloudflareBindings;
  Variables: DBMiddlewareVariables;
};

export type DBMiddlewareVariables = {
  DB: DB;
};

export const dbMiddleware = createMiddleware<DBMiddlewareEnv>(
  async (c, next) => {
    if (c.var.DB) return await next();

    c.set("DB", getDB(c.env));

    await next();
  },
);
