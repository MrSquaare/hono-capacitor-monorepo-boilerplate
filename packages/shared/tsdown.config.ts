import { defineConfig } from "tsdown";

const commonConfig = defineConfig({
  dts: true,
});

export default defineConfig([
  {
    ...commonConfig,
    entry: "src/constants/index.ts",
    outDir: "dist/constants",
  },
  {
    ...commonConfig,
    entry: "src/schemas/index.ts",
    outDir: "dist/schemas",
  },
]);
