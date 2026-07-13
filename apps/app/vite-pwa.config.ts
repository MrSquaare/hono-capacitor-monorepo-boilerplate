import type { VitePWAOptions } from "vite-plugin-pwa";

export const vitePWAConfig: Partial<VitePWAOptions> = {
  manifest: {
    background_color: "#ffffff",
    display: "standalone",
    name: "Project Name",
    orientation: "portrait",
    short_name: "Project Name",
    theme_color: "#000000",
  },
  registerType: "autoUpdate",
};
