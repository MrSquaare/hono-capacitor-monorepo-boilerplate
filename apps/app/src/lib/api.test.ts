import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockedResponse } from "../test/hono.fixture";
import { APIError, handleAPIResponse, ValidationAPIError } from "./api";

describe("handleAPIResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON data for a successful response", async () => {
    const mockedResponse = createMockedResponse({
      json: { foo: "bar" },
      status: 200,
    });

    const result = await handleAPIResponse(mockedResponse);

    expect(result).toEqual({ foo: "bar" });
    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it.each([
    { label: "false", value: false },
    { label: "0", value: 0 },
    { label: '""', value: "" },
    { label: "null", value: null },
  ])(
    "returns parsed falsy value ($label) for a successful response",
    async ({ value }) => {
      const mockedResponse = createMockedResponse({
        json: value,
        status: 200,
      });

      const result = await handleAPIResponse(mockedResponse);

      expect(result).toEqual(value);
      expect(mockedResponse.text).toHaveBeenCalledTimes(1);
    },
  );

  it("throws ValidationAPIError when error response body matches validation error schema", async () => {
    const mockedResponse = createMockedResponse({
      status: 400,
      text: JSON.stringify({
        code: "VALIDATION_FAILED",
        fields: { email: ["Invalid email"] },
        form: [],
        message: "Validation error occurred",
        target: "json",
      }),
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new ValidationAPIError(
        400,
        "VALIDATION_FAILED",
        "Validation error occurred",
        [],
        { email: ["Invalid email"] },
      ),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body matches API error schema", async () => {
    const mockedResponse = createMockedResponse({
      status: 401,
      text: JSON.stringify({
        code: "UNAUTHORIZED",
        message: "You are not authorized",
      }),
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(401, "UNAUTHORIZED", "You are not authorized"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError error response body is not JSON", async () => {
    const mockedResponse = createMockedResponse({
      status: 500,
      text: "Internal Server Error",
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(500, "API_UNKNOWN_ERROR", "Internal Server Error"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when reading text stream fails for successful response", async () => {
    const mockedResponse = createMockedResponse({
      status: 200,
    });

    mockedResponse.text.mockRejectedValueOnce(new Error("Stream abort"));

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(200, "API_DATA_ERROR", "Invalid data received from the API"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when successful response body is not valid JSON", async () => {
    const mockedResponse = createMockedResponse({
      status: 200,
      text: "Invalid JSON",
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(200, "API_DATA_ERROR", "Invalid data received from the API"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when reading text stream fails for error response", async () => {
    const mockedResponse = createMockedResponse({
      status: 504,
    });

    mockedResponse.text.mockRejectedValueOnce(new Error("Stream abort"));

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(504, "API_UNKNOWN_ERROR", "An unexpected error occurred"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body does not match API error schema", async () => {
    const mockedResponse = createMockedResponse({
      status: 502,
      text: JSON.stringify({
        error: "Invalid response format",
      }),
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(
        502,
        "API_UNKNOWN_ERROR",
        '{"error":"Invalid response format"}',
      ),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body is empty", async () => {
    const mockedResponse = createMockedResponse({
      status: 502,
      text: "",
    });

    await expect(handleAPIResponse(mockedResponse)).rejects.toThrow(
      new APIError(502, "API_UNKNOWN_ERROR", "An unexpected error occurred"),
    );

    expect(mockedResponse.text).toHaveBeenCalledTimes(1);
  });
});
