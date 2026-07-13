import type { ErrorHandler } from "hono";

import { APIErrorCode } from "@projectname/shared/schemas";
import { HTTPException } from "hono/http-exception";

import { getAPIError } from "../utils/error";

const statusToCodeMap: Record<number, APIErrorCode> = {
  400: APIErrorCode.BAD_REQUEST,
  401: APIErrorCode.UNAUTHORIZED,
  403: APIErrorCode.FORBIDDEN,
  404: APIErrorCode.NOT_FOUND,
  405: APIErrorCode.METHOD_NOT_ALLOWED,
};

export const errorHandler: ErrorHandler = (error, c) => {
  console.error(error);

  if (error instanceof HTTPException && error.status < 500) {
    const code = statusToCodeMap[error.status] || APIErrorCode.UNKNOWN_ERROR;

    return c.json(getAPIError(code, error.message), error.status);
  }

  return c.json(
    getAPIError(APIErrorCode.INTERNAL_SERVER_ERROR, "Internal Server Error"),
    500,
  );
};
