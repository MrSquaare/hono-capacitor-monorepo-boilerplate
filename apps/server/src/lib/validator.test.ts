import { mockedZValidator } from "../test/hono-zod-validator.mock";

import type { Env } from "hono";

import { APIErrorCode } from "@projectname/shared/schemas";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createMockedContext } from "../test/hono.fixture";
import { validator } from "./validator";

describe("validator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("registers zValidator with the correct target and schema", () => {
    const schema = z.object({ name: z.string() });

    validator("json", schema);

    expect(mockedZValidator).toHaveBeenCalledTimes(1);
    expect(mockedZValidator).toHaveBeenNthCalledWith(
      1,
      "json",
      schema,
      expect.any(Function),
    );
  });

  it("does not return a response when validation succeeds", () => {
    const schema = z.object({ name: z.string() });
    const mockedContext = createMockedContext<Env>();

    validator("json", schema);

    const callback = mockedZValidator.mock.calls[0]?.[2];

    expect(callback).toBeDefined();

    const result = callback!(
      { data: { name: "John" }, success: true, target: "json" },
      mockedContext,
    );

    expect(result).toEqual(undefined);
  });

  it("returns a 400 JSON response with error details when validation fails", () => {
    const schema = z.object({ name: z.string() });
    const mockJsonResponse = {} as Response;
    const mockedContext = createMockedContext<Env>();

    mockedContext.json.mockReturnValueOnce(mockJsonResponse);

    const zodResult = schema.safeParse({ name: 123 });

    expect(zodResult.success).toEqual(false);

    if (zodResult.success) {
      throw new Error("Validation unexpectedly succeeded");
    }

    validator("json", schema);

    const callback = mockedZValidator.mock.calls[0]?.[2];

    expect(callback).toBeDefined();

    const result = callback!(
      {
        data: undefined,
        error: zodResult.error,
        success: false,
        target: "json",
      },
      mockedContext,
    );

    expect(result).toEqual(mockJsonResponse);

    expect(mockedContext.json).toHaveBeenCalledTimes(1);
    expect(mockedContext.json).toHaveBeenNthCalledWith(
      1,
      {
        code: APIErrorCode.VALIDATION_FAILED,
        fields: {
          name: ["Invalid input: expected string, received number"],
        },
        form: [],
        message: "Validation failed",
        target: "json",
      },
      400,
    );
  });
});
