import { eq } from "drizzle-orm";

import type { DB } from "../db";
import type { DBMiddlewareVariables } from "../middlewares/db";
import type { CreateDummyPayload } from "../schemas/dummy";

import { dummies } from "../db/schemas";

export type DummyServiceMiddlewareEnv = {
  Bindings: CloudflareBindings;
  Variables: DBMiddlewareVariables & DummyServiceMiddlewareVariables;
};

export type DummyServiceMiddlewareVariables = {
  dummyService: DummyService;
};

export class DummyService {
  constructor(private db: DB) {}

  async create(payload: CreateDummyPayload) {
    return this.db
      .insert(dummies)
      .values({
        age: payload.age,
        name: payload.name,
      })
      .returning()
      .then((res) => res[0]);
  }

  async delete(id: number) {
    return this.db
      .delete(dummies)
      .where(eq(dummies.id, id))
      .returning()
      .then((res) => res.at(0));
  }

  async get(id: number) {
    return this.db.query.dummies.findFirst({
      where: {
        id: id,
      },
    });
  }

  async list() {
    return this.db.query.dummies.findMany();
  }

  async update(id: number, payload: Partial<CreateDummyPayload>) {
    return this.db
      .update(dummies)
      .set({
        age: payload.age,
        name: payload.name,
      })
      .where(eq(dummies.id, id))
      .returning()
      .then((res) => res.at(0));
  }
}
