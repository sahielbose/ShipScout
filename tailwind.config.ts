import type { Config } from "tailwindcss";

// ShipScout design tokens (CONTEXT.md section 15). Dark theme, blue and white.
// The bulk of the visual system lives in app/globals.css as CSS variables so the
// ported prototype markup keeps its exact look. Tailwind maps those tokens for
// utility use and shadcn-style primitives.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-1": "var(--bg-1)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        card: "var(--card)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        text: "var(--text)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        ghost: "var(--ghost)",
        blue: "var(--blue)",
        "blue-2": "var(--blue-2)",
        "blue-dim": "var(--blue-dim)",
        "blue-bd": "var(--blue-bd)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
