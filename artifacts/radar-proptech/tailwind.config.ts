// artifacts/radar-proptech/tailwind.config.ts
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
        kavox: {
          bg: "#FFFFFF",
          surface: "#F9FAFB",
          body: "#111827",
          muted: "#4B5563",
          accent: "#0F766E", // Teal Oscuro / Petróleo
          alert: "#DC2626",
          success: "#059669",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};

export default config;