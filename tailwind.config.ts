import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        leather: {
          50: "#faf6f0",
          100: "#f2e8da",
          200: "#e4cfb3",
          300: "#d3b088",
          400: "#bf8d5e",
          500: "#a9713f",
          600: "#8c5a33",
          700: "#6f462c",
          800: "#5c3b29",
          900: "#4e3325",
          950: "#2b1a13",
        },
        cream: "#f7f1e6",
        charcoal: "#241b15",
        forest: "#3c4a32",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -15px rgba(43,26,19,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
