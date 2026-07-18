import { APIErrorCode, wsMessageSchema } from "@projectname/shared/schemas";
import { type Connection, Server } from "partyserver";
import { z } from "zod";

import { getAPIError, getValidationAPIError } from "../utils/error";

export class DummiesParty extends Server {
  static options = {
    hibernate: true,
  };

  onConnect(connection: Connection) {
    console.log(
      `WebSocket client connected: ${connection.id} to room ${this.name}`,
    );
  }

  async onRequest(request: Request): Promise<Response> {
    if (request.method === "POST") {
      let json: unknown;

      try {
        json = await request.json();
      } catch {
        return Response.json(
          getAPIError(APIErrorCode.BAD_REQUEST, "Malformed JSON"),
          { status: 400 },
        );
      }

      try {
        const validated = wsMessageSchema.parse(json);

        this.broadcast(JSON.stringify(validated));

        return Response.json({ success: true }, { status: 200 });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Response.json(getValidationAPIError(error, "json"), {
            status: 400,
          });
        }

        return Response.json(
          getAPIError(
            APIErrorCode.INTERNAL_SERVER_ERROR,
            "Internal server error",
          ),
          { status: 500 },
        );
      }
    }

    return Response.json(
      getAPIError(APIErrorCode.METHOD_NOT_ALLOWED, "Method not allowed"),
      { status: 405 },
    );
  }
}
