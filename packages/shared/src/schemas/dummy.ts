import { z } from "zod";

export const dummySchema = z.object({
  age: z.number(),
  id: z.number(),
  name: z.string(),
});

export type Dummy = z.infer<typeof dummySchema>;
