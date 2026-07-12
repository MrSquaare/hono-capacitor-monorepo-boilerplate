import type { ClientResponse } from "hono/client";
import type { StatusCode, SuccessStatusCode } from "hono/utils/http-status";

import {
  apiErrorSchema,
  validationAPIErrorSchema,
} from "@projectname/shared/schemas";

type AnyJSONResponse<
  TJson = unknown,
  TStatusCode extends number = StatusCode,
> = ClientResponse<TJson, TStatusCode, "json">;

type ExtractSuccessJSON<TResponse> =
  TResponse extends AnyJSONResponse<infer TJson, infer TStatus>
    ? TStatus extends SuccessStatusCode
      ? TJson
      : never
    : never;

export class APIError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);

    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationAPIError extends APIError {
  fields: Record<string, string[]>;
  form: string[];

  constructor(
    status: number,
    code: string,
    message: string,
    form: string[],
    fields: Record<string, string[]>,
  ) {
    super(status, code, message);

    this.name = "ValidationAPIError";
    this.form = form;
    this.fields = fields;
  }
}

export const handleAPIResponse = async <TResponse extends AnyJSONResponse>(
  response: TResponse,
): Promise<ExtractSuccessJSON<TResponse>> => {
  const data = await response.json();

  if (!response.ok) {
    const validationAPIErrorRes = validationAPIErrorSchema.safeParse(data);

    if (validationAPIErrorRes.success) {
      throw new ValidationAPIError(
        response.status,
        validationAPIErrorRes.data.code,
        validationAPIErrorRes.data.message,
        validationAPIErrorRes.data.form,
        validationAPIErrorRes.data.fields,
      );
    }

    const apiErrorRes = apiErrorSchema.safeParse(data);

    if (apiErrorRes.success) {
      throw new APIError(
        response.status,
        apiErrorRes.data.code,
        apiErrorRes.data.message,
      );
    }

    throw new APIError(
      response.status,
      "API_ERROR",
      "An unexpected error occurred",
    );
  }

  return data as ExtractSuccessJSON<TResponse>;
};
