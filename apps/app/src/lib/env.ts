export const API_BASE_URL = new URL(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787",
);
export const API_RETRY = Number(import.meta.env.VITE_API_RETRY ?? "3");
