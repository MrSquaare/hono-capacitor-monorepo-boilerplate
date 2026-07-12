import { wsMessageSchema } from "@projectname/shared/schemas";
import { type Connection, Server } from "partyserver";

import { getErrorMessage } from "../utils/error";

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
      try {
        const json = await request.json();
        const validated = wsMessageSchema.parse(json);

        this.broadcast(JSON.stringify(validated));

        return new Response("OK", { status: 200 });
      } catch (error) {
        const message = getErrorMessage(error);

        return new Response(message, { status: 400 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
