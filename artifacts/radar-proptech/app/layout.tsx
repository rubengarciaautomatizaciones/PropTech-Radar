// artifacts/radar-proptech/app/layout.tsx
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 1. Cargamos las fuentes optimizadas desde Google Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata = {
  title: "KAVOX | Inteligencia de Captación Inmobiliaria",
  description: "El único radar PropTech sub-segundo que te pone en el teléfono del particular antes que nadie.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* 2. Inyectamos las variables CSS de las fuentes en el body */}
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-kavox-bg text-kavox-body selection:bg-kavox-accent selection:text-white min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}