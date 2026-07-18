import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import istanbul from "vite-plugin-istanbul";
import { VitePWA } from "vite-plugin-pwa";

import { vitePWAConfig } from "./vite-pwa.config";

export default defineConfig({
  clearScreen: false,
  plugins: [
    paraglideVitePlugin({
      outdir: "./src/paraglide",
      project: "./project.inlang",
    }),
    devtools(),
    tanstackRouter(),
    react(),
    VitePWA(vitePWAConfig),
    istanbul({
      exclude: ["src/paraglide/**", "src/main.tsx", "src/routeTree.gen.ts"],
      include: "src/**",
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
