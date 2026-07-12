import config from "@projectname/shared-config/eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([globalIgnores(["dist/"]), ...config]);
