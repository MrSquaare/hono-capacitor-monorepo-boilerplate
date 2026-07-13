import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.url("VITE_API_BASE_URL must be a valid URL"),
  VITE_API_RETRY: z.coerce
    .number("VITE_API_RETRY must be a valid number")
    .int("VITE_API_RETRY must be an integer")
    .nonnegative("VITE_API_RETRY must be non-negative"),
});

const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_RETRY: import.meta.env.VITE_API_RETRY,
});

export const API_BASE_URL = new URL(env.VITE_API_BASE_URL);
export const API_RETRY = env.VITE_API_RETRY;
