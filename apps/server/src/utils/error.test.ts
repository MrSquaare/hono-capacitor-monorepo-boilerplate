import { APIErrorCode } from "@projectname/shared/schemas";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getAPIError, getErrorMessage, getValidationAPIError } from "./error";

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

describe("getAPIError", () => {
  it("returns an APIError", () => {
    const result = getAPIError(APIErrorCode.NOT_FOUND, "Not found message");

    expect(result).toEqual({
      code: APIErrorCode.NOT_FOUND,
      message: "Not found message",
    });
  });
});

describe("getValidationAPIError", () => {
  it("returns a ValidationAPIError", () => {
    const schema = z.object({
      name: z.string(),
    });
    const parseResult = schema.safeParse({});

    expect(parseResult.success).toBe(false);

    if (!parseResult.success) {
      const result = getValidationAPIError(parseResult.error, "json");

      expect(result).toEqual({
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          name: ["Invalid input: expected string, received undefined"],
        },
        form: [],
        message: "Validation failed",
        target: "json",
      });
    }
  });
});
