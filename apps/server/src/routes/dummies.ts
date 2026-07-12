import { DUMMIES_NOTIFICATION_ROOM_NAME } from "@projectname/shared/constants";
import { APIErrorCode } from "@projectname/shared/schemas";
import { Hono } from "hono";
import z from "zod";

import { validator } from "../lib/validator";
import { dbMiddleware } from "../middlewares/db";
import { dummyServiceMiddleware } from "../middlewares/dummy";
import { createDummyPayloadSchema } from "../schemas/dummy";

export const dummiesApp = new Hono()
  .use(dbMiddleware)
  .use(dummyServiceMiddleware)
  .get("/", async (c) => {
    const { dummyService } = c.var;

    const dummies = await dummyService.list();

    return c.json(dummies, 200);
  })
  .get(
    "/:id",
    validator("param", z.object({ id: z.coerce.number() })),
    async (c) => {
      const { dummyService } = c.var;
      const { id } = c.req.valid("param");

      const dummy = await dummyService.get(id);

      if (!dummy) {
        return c.json(
          { code: APIErrorCode.NOT_FOUND, message: "Dummy not found" },
          404,
        );
      }

      return c.json(dummy, 200);
    },
  )
  .post("/", validator("json", createDummyPayloadSchema), async (c) => {
    const { dummyService } = c.var;
    const payload = c.req.valid("json");

    const dummy = await dummyService.create(payload);

    const stub = c.env.DUMMIES.get(
      c.env.DUMMIES.idFromName(DUMMIES_NOTIFICATION_ROOM_NAME),
    );

    await stub.fetch("http://localhost/", {
      body: JSON.stringify({
        type: "DUMMY_CREATED",
      }),
      method: "POST",
    });

    return c.json(dummy, 201);
  })
  .put(
    "/:id",
    validator("param", z.object({ id: z.coerce.number() })),
    validator("json", createDummyPayloadSchema.partial()),
    async (c) => {
      const { dummyService } = c.var;
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const dummy = await dummyService.update(id, payload);

      if (!dummy) {
        return c.json(
          { code: APIErrorCode.NOT_FOUND, message: "Dummy not found" },
          404,
        );
      }

      return c.json(dummy, 200);
    },
  )
  .delete(
    "/:id",
    validator("param", z.object({ id: z.coerce.number() })),
    async (c) => {
      const { dummyService } = c.var;
      const { id } = c.req.valid("param");

      const dummy = await dummyService.delete(id);

      if (!dummy) {
        return c.json(
          { code: APIErrorCode.NOT_FOUND, message: "Dummy not found" },
          404,
        );
      }

      return c.json(dummy, 200);
    },
  );
