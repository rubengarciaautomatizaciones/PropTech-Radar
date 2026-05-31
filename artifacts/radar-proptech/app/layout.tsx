// artifacts/radar-proptech/app/layout.tsx
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
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
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased font-sans bg-kavox-bg text-kavox-body selection:bg-kavox-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}