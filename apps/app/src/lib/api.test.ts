import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockedResponse } from "../test/hono.fixture";
import { APIError, handleAPIResponse, ValidationAPIError } from "./api";

describe("handleAPIResponse", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON data for a successful response", async () => {
    const mockResponse = createMockedResponse({
      json: { foo: "bar" },
      status: 200,
    });

    const result = await handleAPIResponse(mockResponse);

    expect(result).toEqual({ foo: "bar" });
    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws ValidationAPIError when error response body matches validation error schema", async () => {
    const mockResponse = createMockedResponse({
      status: 400,
      text: JSON.stringify({
        code: "VALIDATION_FAILED",
        fields: { email: ["Invalid email"] },
        form: [],
        message: "Validation error occurred",
        target: "json",
      }),
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new ValidationAPIError(
        400,
        "VALIDATION_FAILED",
        "Validation error occurred",
        [],
        { email: ["Invalid email"] },
      ),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body matches API error schema", async () => {
    const mockResponse = createMockedResponse({
      status: 401,
      text: JSON.stringify({
        code: "UNAUTHORIZED",
        message: "You are not authorized",
      }),
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(401, "UNAUTHORIZED", "You are not authorized"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError error response body is not JSON", async () => {
    const mockResponse = createMockedResponse({
      status: 500,
      text: "Internal Server Error",
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(500, "API_UNKNOWN_ERROR", "Internal Server Error"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when reading text stream fails for successful response", async () => {
    const mockResponse = createMockedResponse({
      status: 200,
    });

    mockResponse.text.mockRejectedValueOnce(new Error("Stream abort"));

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(200, "API_DATA_ERROR", "Invalid data received from the API"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when successful response body is not valid JSON", async () => {
    const mockResponse = createMockedResponse({
      status: 200,
      text: "Invalid JSON",
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(200, "API_DATA_ERROR", "Invalid data received from the API"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when reading text stream fails for error response", async () => {
    const mockResponse = createMockedResponse({
      status: 504,
    });

    mockResponse.text.mockRejectedValueOnce(new Error("Stream abort"));

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(504, "API_UNKNOWN_ERROR", "An unexpected error occurred"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body does not match API error schema", async () => {
    const mockResponse = createMockedResponse({
      status: 502,
      text: JSON.stringify({
        error: "Invalid response format",
      }),
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(
        502,
        "API_UNKNOWN_ERROR",
        '{"error":"Invalid response format"}',
      ),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });

  it("throws APIError when error response body is empty", async () => {
    const mockResponse = createMockedResponse({
      status: 502,
      text: "",
    });

    await expect(handleAPIResponse(mockResponse)).rejects.toThrow(
      new APIError(502, "API_UNKNOWN_ERROR", "An unexpected error occurred"),
    );

    expect(mockResponse.text).toHaveBeenCalledTimes(1);
  });
});
