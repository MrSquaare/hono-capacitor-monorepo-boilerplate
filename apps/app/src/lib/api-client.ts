import type { AppType } from "@projectname/server";

import { hc } from "hono/client";

import { API_BASE_URL } from "./env";

export const apiClient = hc<AppType>(API_BASE_URL.toString());
