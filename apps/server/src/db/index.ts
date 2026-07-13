import { drizzle } from "drizzle-orm/d1";

import { relations } from "./relations";

export const getDB = (env: CloudflareBindings) => {
  return drizzle(env.DB, {
    relations,
  });
};

export type DB = ReturnType<typeof getDB>;
