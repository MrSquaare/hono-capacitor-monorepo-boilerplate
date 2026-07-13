import config from "@projectname/shared-config/eslint";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import tanstackRouter from "@tanstack/eslint-plugin-router";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores([
    "dist/",
    "styled-system/",
    "playwright-report/",
    "src/paraglide/",
    "src/routeTree.gen.ts",
    "android/",
    "ios/",
  ]),
  ...config,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  ...tanstackRouter.configs["flat/recommended"],
  ...tanstackQuery.configs["flat/recommended"],
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react-refresh/only-export-components": [
        "error",
        {
          allowExportNames: ["Route"],
        },
      ],
    },
  },
]);
