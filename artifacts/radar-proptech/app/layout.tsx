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
  title: "KAVOX | Alertas de Particulares en Tiempo Real",
  description: "Deja de perder exclusivas por llegar horas tarde. KAVOX intercepta los anuncios de particulares al momento en el que son publicados y te avisa al móvil para que seas el primero en llamar.",
  // 1. ESTO LE DICE A GOOGLE EL NOMBRE DE TU MARCA
  applicationName: "KAVOX",
  openGraph: {
    siteName: "KAVOX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* 2. SCRIPT OFICIAL DE GOOGLE PARA FORZAR EL NOMBRE DEL SITIO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "KAVOX",
              "url": "https://kavox.tech/"
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-kavox-bg text-kavox-body selection:bg-kavox-accent selection:text-white min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}