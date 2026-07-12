import { z } from "zod";

export const wsMessageSchema = z.object({
  type: z.literal("DUMMY_CREATED"),
});

export type WSMessage = z.infer<typeof wsMessageSchema>;
