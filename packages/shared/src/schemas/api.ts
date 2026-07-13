import { z } from "zod";

export enum APIErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  VALIDATION_FAILED = "VALIDATION_FAILED",
}

export const apiErrorSchema = z.object({
  code: z.enum(APIErrorCode),
  message: z.string(),
});

export type APIError = z.infer<typeof apiErrorSchema>;

export const validationAPIErrorSchema = apiErrorSchema.extend({
  fields: z.record(z.string(), z.array(z.string())),
  form: z.array(z.string()),
  target: z.string(),
});

export type ValidationAPIError = z.infer<typeof validationAPIErrorSchema>;
