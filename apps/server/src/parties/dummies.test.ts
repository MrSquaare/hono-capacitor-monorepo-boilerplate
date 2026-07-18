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

    const body = await res.json();

    expect(body).toEqual({ success: true });

    const received = await messagePromise;

    expect(JSON.parse(received)).toEqual(payload);

    clientWS!.close();
  });

  it("returns 400 when POST payload is malformed JSON", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const res = await stub.fetch("http://localhost/", {
      body: "invalid-json",
      method: "POST",
    });

    expect(res.status).toBe(400);

    const body = await res.json();

    expect(body).toEqual({
      code: "BAD_REQUEST",
      message: "Malformed JSON",
    });
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

    const body = await res.json();

    expect(body).toEqual({
      code: "VALIDATION_FAILED",
      fields: {
        type: ['Invalid input: expected "DUMMY_CREATED"'],
      },
      form: [],
      message: "Validation failed",
      target: "json",
    });
  });

  it("propagates unexpected errors", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    await runInDurableObject(stub, (instance: DummiesParty) => {
      vi.spyOn(instance, "broadcast").mockImplementation(() => {
        throw new Error("Broadcast failed");
      });
    });

    const payload = { type: "DUMMY_CREATED" };

    const res = await stub.fetch("http://localhost/", {
      body: JSON.stringify(payload),
      method: "POST",
    });

    expect(res.status).toBe(500);

    const body = await res.json();

    expect(body).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  });

  it("returns 405 for unsupported HTTP methods", async () => {
    const id = env.DUMMIES.idFromName("test-room");
    const stub = env.DUMMIES.get(id);

    const res = await stub.fetch("http://localhost/", {
      method: "GET",
    });

    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("POST");

    const body = await res.json();

    expect(body).toEqual({
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
    });
  });
});
