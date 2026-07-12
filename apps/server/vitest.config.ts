import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.jsonc",
      },
    }),
  ],
  test: {
    coverage: {
      enabled: true,
      exclude: [
        ...(configDefaults.coverage?.exclude ?? []),
        "**/*.mock.ts",
        "**/*.fixture.ts",
      ],
      provider: "istanbul",
      reporter: ["text", "html", "cobertura"],
    },
  },
});
