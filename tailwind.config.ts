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
        gecko: {
          green: "#8DC647",
          dark: "#0D1117",
          card: "#161B22",
          border: "#21262D",
          muted: "#8B949E",
        },
      },
    },
  },
  plugins: [],
};
export default config;
