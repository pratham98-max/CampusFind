import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: "#0B1F4D",
            hover: "#132d69",
            light: "#1d3e87",
            dark: "#061330",
            subtle: "#eef2f9",
          },
          gold: {
            DEFAULT: "#F5C542",
            hover: "#e5b530",
            light: "#fef6dc",
            dark: "#c7981a",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
