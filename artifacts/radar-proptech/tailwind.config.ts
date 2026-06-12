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
          surface: "#fafafa",   
          body: "#1c1c1c",      
          muted: "#575757",     
          accent: "#008799",    
          alert: "#DC2626",     
          success: "#059669",   
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
        },
        /* ORQUESTA iOS DESDE ABAJO */
        "notify-enter-bottom": {
          "0%, 15%": { opacity: "0", transform: "translateY(30px) scale(0.95)" }, 
          "18%, 45%": { opacity: "1", transform: "translateY(0) scale(1)" }, 
          "46%, 47%": { opacity: "1", transform: "translateY(0) scale(0.97)" }, 
          "48%, 85%": { opacity: "1", transform: "translateY(0) scale(1)" }, 
          "88%, 100%": { opacity: "0", transform: "translateY(20px) scale(0.95)" }, 
        },
        /* ALTURA REDUCIDA A 250px PARA ELIMINAR EL ESPACIO VACÍO */
        "notify-expand-bottom": {
          "0%, 46%": { height: "70px", padding: "12px", backgroundColor: "rgba(225, 225, 225, 0.95)" },
          "48%, 85%": { height: "230px", padding: "16px", backgroundColor: "rgba(250, 250, 250, 1)" },
          "88%, 100%": { height: "70px", padding: "12px", backgroundColor: "rgba(225, 225, 225, 0.95)" },
        },
        "content-fade-out": {
          "0%, 45%": { opacity: "1", visibility: "visible" },
          "46%, 100%": { opacity: "0", visibility: "hidden" },
        },
        "content-fade-in": {
          "0%, 47%": { opacity: "0", visibility: "hidden" },
          "49%, 85%": { opacity: "1", visibility: "visible" },
          "88%, 100%": { opacity: "0", visibility: "hidden" },
        },
        "bg-dim": {
          "0%, 45%": { opacity: "0" }, 
          "48%, 85%": { opacity: "1" }, 
          "88%, 100%": { opacity: "0" }, 
        },
        "lock-fade": {
          "0%, 45%": { opacity: "1", transform: "scale(1)" }, 
          "48%, 85%": { opacity: "0.5", transform: "scale(0.96)" }, 
          "88%, 100%": { opacity: "1", transform: "scale(1)" }, 
        },
      },
      animation: {
        "slide-down": "slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "notify-enter": "notify-enter-bottom 10s ease-in-out infinite",
        "notify-expand": "notify-expand-bottom 10s ease-in-out infinite",
        "content-fade-out": "content-fade-out 10s ease-in-out infinite",
        "content-fade-in": "content-fade-in 10s ease-in-out infinite",
        "bg-dim": "bg-dim 10s ease-in-out infinite",
        "lock-fade": "lock-fade 10s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};

export default config;