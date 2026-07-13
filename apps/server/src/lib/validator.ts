import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

import { zValidator } from "@hono/zod-validator";

import { getValidationAPIError } from "../utils/error";

export const validator = <
  Target extends keyof ValidationTargets,
  Schema extends ZodType,
>(
  target: Target,
  schema: Schema,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(getValidationAPIError(result.error, target), 400);
    }
  });
};
