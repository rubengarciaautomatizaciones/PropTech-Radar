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
          bg: "#FFFFFF",        // Blanco puro
          surface: "#fafafa",   // Gris ultra-claro
          body: "#1c1c1c",      // Gris casi negro
          muted: "#575757",     // Gris medio
          accent: "#008799",    // Acento tecnológico
          alert: "#DC2626",     // Rojo error
          success: "#059669",   // Verde éxito
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      keyframes: {
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        }
      },
      animation: {
        "slide-down": "slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }
    },
  },
  plugins: [],
};

export default config;