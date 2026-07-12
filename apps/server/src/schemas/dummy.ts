import z from "zod";

export const createDummyPayloadSchema = z.object({
  age: z.number(),
  name: z.string(),
});

export type CreateDummyPayload = z.infer<typeof createDummyPayloadSchema>;

export const updateDummyPayloadSchema = createDummyPayloadSchema.partial();

export type UpdateDummyPayload = z.infer<typeof updateDummyPayloadSchema>;
