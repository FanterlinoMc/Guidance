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
        // Muted gold accent and warm paper neutral -- used sparingly (chips, dividers, the
        // header's watermark motif) so the widget reads as considered financial-services
        // branding rather than a stock blue-bubble chat template.
        "brand-gold": "#C9A227",
        "brand-paper": "#F6F3EC",
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
