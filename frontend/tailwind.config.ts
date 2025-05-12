import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      fontSize: {
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
      },
    },
  },
  plugins: [],
};

export default config; 