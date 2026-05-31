// artifacts/radar-proptech/app/layout.tsx
import "./globals.css";

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
      <body className="antialiased bg-kavox-bg text-kavox-body selection:bg-kavox-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}