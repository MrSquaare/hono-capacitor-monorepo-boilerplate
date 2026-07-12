import { runInDurableObject } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DummiesParty } from "./dummies";

describe("DummiesParty", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles onConnect by registering connection", async () => {
    const spyConsole = vi.spyOn(console, "log").mockImplementation(() => {});
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const res = await stub.fetch("http://localhost/", {
      headers: { Upgrade: "websocket" },
    });

    expect(res.status).toBe(101);

    const clientWS = res.webSocket;

    expect(clientWS).toBeDefined();
    clientWS!.accept();

    let connectionId = "";

    await runInDurableObject(stub, (instance: DummiesParty) => {
      const connections = [...instance.getConnections()];

      expect(connections.length).toBe(1);

      connectionId = connections[0]!.id;
    });

    expect(spyConsole).toHaveBeenCalledTimes(1);
    expect(spyConsole).toHaveBeenNthCalledWith(
      1,
      `WebSocket client connected: ${connectionId} to room test-room`,
    );

    clientWS!.close();
  });

  it("broadcasts validated payload on POST request", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const wsRes = await stub.fetch("http://localhost/", {
      headers: { Upgrade: "websocket" },
    });
    const clientWS = wsRes.webSocket;

    clientWS!.accept();

    const messagePromise = new Promise<string>((resolve) => {
      clientWS!.addEventListener("message", (event: MessageEvent) => {
        resolve(event.data as string);
      });
    });

    const payload = { type: "DUMMY_CREATED" };
    const res = await stub.fetch("http://localhost/", {
      body: JSON.stringify(payload),
      method: "POST",
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");

    const received = await messagePromise;

    expect(JSON.parse(received)).toEqual(payload);

    clientWS!.close();
  });

  it("returns 400 when POST payload is invalid", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const payload = { type: "INVALID" };
    const res = await stub.fetch("http://localhost/", {
      body: JSON.stringify(payload),
      method: "POST",
    });

    expect(res.status).toBe(400);

    const body = JSON.parse(await res.text());

    expect(body).toEqual([
      {
        code: "invalid_value",
        message: 'Invalid input: expected "DUMMY_CREATED"',
        path: ["type"],
        values: ["DUMMY_CREATED"],
      },
    ]);
  });

  it("returns 405 for unsupported HTTP methods", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const res = await stub.fetch("http://localhost/", {
      method: "GET",
    });

    expect(res.status).toBe(405);
    expect(await res.text()).toBe("Method not allowed");
  });
});
