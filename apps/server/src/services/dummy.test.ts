import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DB } from "../db";

import { dummies } from "../db/schemas";
import { createMockedDrizzleD1DB } from "../test/drizzle-orm-d1.fixture";
import { DummyService } from "./dummy";

describe("DummyService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("initializes with the db instance", () => {
      const mockedDB = createMockedDrizzleD1DB<DB>();
      const service = new DummyService(mockedDB);

      expect(service["db"]).toEqual(mockedDB);
    });
  });

  describe("create", () => {
    it("inserts a new dummy and returns the created record", async () => {
      const payload = { age: 25, name: "Alice" };
      const createdDummy = { age: 25, id: 1, name: "Alice" };
      const mockedDB = createMockedDrizzleD1DB<DB>();

      mockedDB.returning.mockResolvedValueOnce([createdDummy]);

      const service = new DummyService(mockedDB);
      const result = await service.create(payload);

      expect(result).toEqual(createdDummy);

      expect(mockedDB.insert).toHaveBeenCalledTimes(1);
      expect(mockedDB.insert).toHaveBeenNthCalledWith(1, dummies);

      expect(mockedDB.values).toHaveBeenCalledTimes(1);
      expect(mockedDB.values).toHaveBeenNthCalledWith(1, {
        age: 25,
        name: "Alice",
      });

      expect(mockedDB.returning).toHaveBeenCalledTimes(1);
      expect(mockedDB.returning).toHaveBeenNthCalledWith(1);
    });
  });

  describe("delete", () => {
    it("deletes the dummy by id and returns the deleted record", async () => {
      const deletedDummy = { age: 30, id: 2, name: "Bob" };
      const mockedDB = createMockedDrizzleD1DB<DB>();

      mockedDB.returning.mockResolvedValueOnce([deletedDummy]);

      const service = new DummyService(mockedDB);
      const result = await service.delete(2);

      expect(result).toEqual(deletedDummy);

      expect(mockedDB.delete).toHaveBeenCalledTimes(1);
      expect(mockedDB.delete).toHaveBeenNthCalledWith(1, dummies);

      expect(mockedDB.where).toHaveBeenCalledTimes(1);
      expect(mockedDB.where).toHaveBeenNthCalledWith(1, eq(dummies.id, 2));

      expect(mockedDB.returning).toHaveBeenCalledTimes(1);
      expect(mockedDB.returning).toHaveBeenNthCalledWith(1);
    });
  });

  describe("get", () => {
    it("finds the first dummy by id", async () => {
      const expectedDummy = { age: 35, id: 3, name: "Charlie" };
      const mockedDB = createMockedDrizzleD1DB<DB>();

      mockedDB.findFirst.mockResolvedValueOnce(expectedDummy);

      const service = new DummyService(mockedDB);
      const result = await service.get(3);

      expect(result).toEqual(expectedDummy);

      expect(mockedDB.findFirst).toHaveBeenCalledTimes(1);
      expect(mockedDB.findFirst).toHaveBeenNthCalledWith(1, {
        where: {
          id: 3,
        },
      });
    });
  });

  describe("list", () => {
    it("returns all dummies", async () => {
      const expectedDummies = [
        { age: 20, id: 4, name: "Dave" },
        { age: 22, id: 5, name: "Eve" },
      ];
      const mockedDB = createMockedDrizzleD1DB<DB>();

      mockedDB.findMany.mockResolvedValueOnce(expectedDummies);

      const service = new DummyService(mockedDB);
      const result = await service.list();

      expect(result).toEqual(expectedDummies);

      expect(mockedDB.findMany).toHaveBeenCalledTimes(1);
      expect(mockedDB.findMany).toHaveBeenNthCalledWith(1);
    });
  });

  describe("update", () => {
    it("updates the dummy and returns the updated record", async () => {
      const payload = { age: 40 };
      const updatedDummy = { age: 40, id: 6, name: "Frank" };
      const mockedDB = createMockedDrizzleD1DB<DB>();

      mockedDB.returning.mockResolvedValueOnce([updatedDummy]);

      const service = new DummyService(mockedDB);
      const result = await service.update(6, payload);

      expect(result).toEqual(updatedDummy);

      expect(mockedDB.update).toHaveBeenCalledTimes(1);
      expect(mockedDB.update).toHaveBeenNthCalledWith(1, dummies);

      expect(mockedDB.set).toHaveBeenCalledTimes(1);
      expect(mockedDB.set).toHaveBeenNthCalledWith(1, {
        age: 40,
        name: undefined,
      });

      expect(mockedDB.where).toHaveBeenCalledTimes(1);
      expect(mockedDB.where).toHaveBeenNthCalledWith(1, eq(dummies.id, 6));

      expect(mockedDB.returning).toHaveBeenCalledTimes(1);
      expect(mockedDB.returning).toHaveBeenNthCalledWith(1);
    });
  });
});
