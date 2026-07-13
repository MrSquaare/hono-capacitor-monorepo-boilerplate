import { Hono } from "hono";
import { partyserverMiddleware } from "hono-party";
import { cors } from "hono/cors";

import { errorHandler } from "./middlewares/error-handler";
import { DummiesParty } from "./parties/dummies";
import { dummiesApp } from "./routes/dummies";

const app = new Hono()
  .use(cors())
  .route("/dummies", dummiesApp)
  .use("/parties/*", partyserverMiddleware())
  .onError(errorHandler);

export type AppType = typeof app;
export default app;
export { DummiesParty };
