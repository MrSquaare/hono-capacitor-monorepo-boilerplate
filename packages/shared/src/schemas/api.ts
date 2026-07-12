import { z } from "zod";

export enum APIErrorCode {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
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
