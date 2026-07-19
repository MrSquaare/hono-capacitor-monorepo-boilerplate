import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        ...(configDefaults.coverage?.exclude ?? []),
        "src/**/*.mock.ts",
        "src/**/*.fixture.ts",
      ],
      provider: "istanbul",
      reporter: ["text", "html", "cobertura"],
      reportsDirectory: "coverage/unit/",
    },
    include: ["src/**/*.test.ts"],
  },
});
