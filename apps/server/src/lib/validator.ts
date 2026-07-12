import type { ValidationTargets } from "hono";

import { zValidator } from "@hono/zod-validator";
import { APIErrorCode } from "@projectname/shared/schemas";
import { z, type ZodType } from "zod";

export const validator = <
  Target extends keyof ValidationTargets,
  Schema extends ZodType,
>(
  target: Target,
  schema: Schema,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const flatErrors = z.flattenError(result.error);

      return c.json(
        {
          code: APIErrorCode.VALIDATION_FAILED,
          fields: flatErrors.fieldErrors,
          form: flatErrors.formErrors,
          message: "Validation failed",
          target,
        },
        400,
      );
    }
  });
};
