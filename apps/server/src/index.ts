import { APIErrorCode } from "@projectname/shared/schemas";
import { Hono } from "hono";
import { partyserverMiddleware } from "hono-party";
import { cors } from "hono/cors";

import { DummiesParty } from "./parties/dummies";
import { dummiesApp } from "./routes/dummies";

const app = new Hono()
  .use(cors())
  .route("/dummies", dummiesApp)
  .use("/parties/*", partyserverMiddleware())
  .onError((error, c) => {
    console.error(error);

    return c.json(
      {
        code: APIErrorCode.INTERNAL_SERVER_ERROR,
        message: error.message || "Internal Server Error",
      },
      500,
    );
  });

export type AppType = typeof app;
export default app;
export { DummiesParty };
