import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F2F2F",
        accent: "#C6A14A",
        dark: "#0B0B0B",
      },
    },
  },
  plugins: [],
};

export default config;
