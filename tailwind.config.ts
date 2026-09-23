import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F1",
        sand: "#F0E7DA",
        clay: "#C98F65",
        forest: "#4A5D50",
        ink: "#2E2A26",
        muted: "#8A8178",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
