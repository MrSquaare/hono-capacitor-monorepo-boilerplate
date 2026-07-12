import { QueryClient } from "@tanstack/react-query";

import { API_RETRY } from "./env";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: API_RETRY,
    },
  },
});
