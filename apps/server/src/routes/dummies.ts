import { DUMMIES_NOTIFICATION_ROOM_NAME } from "@projectname/shared/constants";
import { APIErrorCode } from "@projectname/shared/schemas";
import { Hono } from "hono";
import z from "zod";

import { validator } from "../lib/validator";
import { dbMiddleware } from "../middlewares/db";
import { dummyServiceMiddleware } from "../middlewares/dummy";
import {
  createDummyPayloadSchema,
  updateDummyPayloadSchema,
} from "../schemas/dummy";
import { getAPIError } from "../utils/error";

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
          getAPIError(APIErrorCode.NOT_FOUND, "Dummy not found"),
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

    try {
      await stub.fetch("http://localhost/", {
        body: JSON.stringify({
          type: "DUMMY_CREATED",
        }),
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to send DUMMY_CREATED notification:", error);
    }

    return c.json(dummy, 201);
  })
  .put(
    "/:id",
    validator("param", z.object({ id: z.coerce.number() })),
    validator("json", updateDummyPayloadSchema),
    async (c) => {
      const { dummyService } = c.var;
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const dummy = await dummyService.update(id, payload);

      if (!dummy) {
        return c.json(
          getAPIError(APIErrorCode.NOT_FOUND, "Dummy not found"),
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
          getAPIError(APIErrorCode.NOT_FOUND, "Dummy not found"),
          404,
        );
      }

      return c.json(dummy, 200);
    },
  );
