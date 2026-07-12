import { describe, expect, it } from "vitest";

import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
  it("returns error message when value is an instance of Error", () => {
    const error = new Error("Test error message");
    const result = getErrorMessage(error);

    expect(result).toEqual("Test error message");
  });

  it("returns message property when value is an object with a message property", () => {
    const error = { message: "Object message property" };
    const result = getErrorMessage(error);

    expect(result).toEqual("Object message property");
  });

  it("returns string representation when value is a string", () => {
    const error = "Simple string error";
    const result = getErrorMessage(error);

    expect(result).toEqual("Simple string error");
  });

  it("returns string representation when value is a number", () => {
    const error = 500;
    const result = getErrorMessage(error);

    expect(result).toEqual("500");
  });

  it("returns string representation when value is an object without a message property", () => {
    const error = { code: "SOME_ERROR" };
    const result = getErrorMessage(error);

    expect(result).toEqual("[object Object]");
  });

  it("returns string representation when value is null", () => {
    const error = null;
    const result = getErrorMessage(error);

    expect(result).toEqual("null");
  });

  it("returns string representation when value is undefined", () => {
    const error = undefined;
    const result = getErrorMessage(error);

    expect(result).toEqual("undefined");
  });
});
