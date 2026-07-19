import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: "#0B2545",
      },
      screens: {
        // spec's mobile-takeover cutoff — Tailwind's default `sm:` is 640px
        widget: "480px",
      },
    },
  },
  plugins: [],
};
export default config;
