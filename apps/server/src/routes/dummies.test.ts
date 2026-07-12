import { mockedDBMiddleware } from "../middlewares/db.mock";
import { mockedDummyServiceMiddleware } from "../middlewares/dummy.mock";
import { DummyServiceMock } from "../services/dummy.mock";
import { useSpy } from "../test/hono.mock";

import { APIErrorCode } from "@projectname/shared/schemas";
import { env } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummiesApp } from "./dummies";

describe("dummiesApp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("setup up middlewares", async () => {
      expect(useSpy).toHaveBeenCalledTimes(2);
      expect(useSpy).toHaveBeenNthCalledWith(1, mockedDBMiddleware);
      expect(useSpy).toHaveBeenNthCalledWith(2, mockedDummyServiceMiddleware);
    });
  });

  describe("GET /", () => {
    it("returns all dummies", async () => {
      const expectedDummies = [{ age: 25, id: 1, name: "Alice" }];

      DummyServiceMock.list.mockResolvedValueOnce(expectedDummies);

      const res = await dummiesApp.request("/", { method: "GET" }, env);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(expectedDummies);

      expect(DummyServiceMock.list).toHaveBeenCalledTimes(1);
      expect(DummyServiceMock.list).toHaveBeenNthCalledWith(1);
    });
  });

  describe("GET /:id", () => {
    it("returns the dummy when found", async () => {
      const expectedDummy = { age: 25, id: 1, name: "Alice" };

      DummyServiceMock.get.mockResolvedValueOnce(expectedDummy);

      const res = await dummiesApp.request("/1", { method: "GET" }, env);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(expectedDummy);

      expect(DummyServiceMock.get).toHaveBeenCalledTimes(1);
      expect(DummyServiceMock.get).toHaveBeenNthCalledWith(1, 1);
    });

    it("returns 404 when not found", async () => {
      DummyServiceMock.get.mockResolvedValueOnce(undefined);

      const res = await dummiesApp.request("/1", { method: "GET" }, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        code: APIErrorCode.NOT_FOUND,
        message: "Dummy not found",
      });
    });

    it("returns 400 when id param is invalid", async () => {
      const res = await dummiesApp.request("/abc", { method: "GET" }, env);

      expect(res.status).toBe(400);

      const body = await res.json();

      expect(body).toEqual({
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          id: ["Invalid input: expected number, received NaN"],
        },
        form: [],
        message: "Validation failed",
        target: "param",
      });
    });
  });

  describe("POST /", () => {
    it("creates a new dummy and broadcasts the notification", async () => {
      const payload = { age: 30, name: "Bob" };
      const createdDummy = { age: 30, id: 2, name: "Bob" };

      DummyServiceMock.create.mockResolvedValueOnce(createdDummy);

      const res = await dummiesApp.request(
        "/",
        {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
        env,
      );

      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(createdDummy);

      expect(DummyServiceMock.create).toHaveBeenCalledTimes(1);
      expect(DummyServiceMock.create).toHaveBeenNthCalledWith(1, payload);
    });

    it("returns 400 when JSON body is invalid", async () => {
      const payload = { age: "invalid" };
      const res = await dummiesApp.request(
        "/",
        {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
        env,
      );

      expect(res.status).toBe(400);

      const body = await res.json();

      expect(body).toEqual({
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          age: ["Invalid input: expected number, received string"],
          name: ["Invalid input: expected string, received undefined"],
        },
        form: [],
        message: "Validation failed",
        target: "json",
      });
    });
  });

  describe("PUT /:id", () => {
    it("updates the dummy when found", async () => {
      const payload = { age: 35 };
      const updatedDummy = { age: 35, id: 1, name: "Alice" };

      DummyServiceMock.update.mockResolvedValueOnce(updatedDummy);

      const res = await dummiesApp.request(
        "/1",
        {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "PUT",
        },
        env,
      );

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(updatedDummy);

      expect(DummyServiceMock.update).toHaveBeenCalledTimes(1);
      expect(DummyServiceMock.update).toHaveBeenNthCalledWith(1, 1, payload);
    });

    it("returns 404 when not found", async () => {
      DummyServiceMock.update.mockResolvedValueOnce(undefined);

      const res = await dummiesApp.request(
        "/1",
        {
          body: JSON.stringify({ age: 35 }),
          headers: { "Content-Type": "application/json" },
          method: "PUT",
        },
        env,
      );

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        code: APIErrorCode.NOT_FOUND,
        message: "Dummy not found",
      });
    });

    it("returns 400 when id param is invalid", async () => {
      const res = await dummiesApp.request(
        "/abc",
        {
          body: JSON.stringify({ age: 35 }),
          headers: { "Content-Type": "application/json" },
          method: "PUT",
        },
        env,
      );

      expect(res.status).toBe(400);

      const body = await res.json();

      expect(body).toEqual({
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          id: ["Invalid input: expected number, received NaN"],
        },
        form: [],
        message: "Validation failed",
        target: "param",
      });
    });
  });

  describe("DELETE /:id", () => {
    it("deletes the dummy when found", async () => {
      const deletedDummy = { age: 25, id: 1, name: "Alice" };

      DummyServiceMock.delete.mockResolvedValueOnce(deletedDummy);

      const res = await dummiesApp.request("/1", { method: "DELETE" }, env);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(deletedDummy);

      expect(DummyServiceMock.delete).toHaveBeenCalledTimes(1);
      expect(DummyServiceMock.delete).toHaveBeenNthCalledWith(1, 1);
    });

    it("returns 404 when not found", async () => {
      DummyServiceMock.delete.mockResolvedValueOnce(undefined);

      const res = await dummiesApp.request("/1", { method: "DELETE" }, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        code: APIErrorCode.NOT_FOUND,
        message: "Dummy not found",
      });
    });

    it("returns 400 when id param is invalid", async () => {
      const res = await dummiesApp.request("/abc", { method: "DELETE" }, env);

      expect(res.status).toBe(400);

      const body = await res.json();

      expect(body).toEqual({
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          id: ["Invalid input: expected number, received NaN"],
        },
        form: [],
        message: "Validation failed",
        target: "param",
      });
    });
  });
});
