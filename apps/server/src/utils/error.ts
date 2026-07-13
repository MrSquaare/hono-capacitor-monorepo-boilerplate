import {
  type APIError,
  APIErrorCode,
  type ValidationAPIError,
} from "@projectname/shared/schemas";
import { z } from "zod";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error !== null && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error);
};

export const getAPIError = <
  TCode extends APIErrorCode,
  TMessage extends string,
>(
  code: TCode,
  message: TMessage,
) => {
  return {
    code: code as TCode,
    message,
  } satisfies APIError;
};

export const getValidationAPIError = <
  TError extends z.core.$ZodError,
  TTarget extends string,
>(
  error: TError,
  target: TTarget,
) => {
  const flatErrors = z.flattenError(error);

  return {
    code: APIErrorCode.VALIDATION_FAILED,
    fields: flatErrors.fieldErrors,
    form: flatErrors.formErrors,
    message: "Validation failed",
    target,
  } satisfies ValidationAPIError;
};
