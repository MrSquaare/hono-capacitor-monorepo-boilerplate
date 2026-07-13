import config from "@projectname/shared-config/eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores([
    ".wrangler/",
    "drizzle/",
    "dist/",
    "worker-configuration.d.ts",
  ]),
  ...config,
  {
    languageOptions: {
      globals: globals.nodeBuiltin,
    },
  },
]);
