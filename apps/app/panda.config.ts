import { defineConfig, defineKeyframes, defineTokens } from "@pandacss/dev";

const keyframes = defineKeyframes({
  fadeIn: {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  fadeOut: {
    "0%": { opacity: "1" },
    "100%": { opacity: "0" },
  },
  scaleIn: {
    "0%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
    "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
  },
  scaleOut: {
    "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
    "100%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
  },
});

const tokens = defineTokens({
  easings: {
    snappy: { value: "cubic-bezier(0.16, 1, 0.3, 1)" },
  },
  zIndex: {
    modal: { value: "1400" },
    overlay: { value: "1300" },
  },
});

export default defineConfig({
  exclude: [],
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  outdir: "styled-system",
  preflight: true,
  theme: {
    extend: {
      keyframes,
      tokens,
    },
  },
});
