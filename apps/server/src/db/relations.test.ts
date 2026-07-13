import { mockedDefineRelations } from "../test/drizzle-orm.mock";

import { describe, expect, it } from "vitest";

import "./relations";
import * as schemas from "./schemas";

describe("relations", () => {
  it("defines relations on schemas", () => {
    expect(mockedDefineRelations).toHaveBeenCalledTimes(1);
    expect(mockedDefineRelations).toHaveBeenNthCalledWith(
      1,
      schemas,
      expect.any(Function),
    );
  });
});
