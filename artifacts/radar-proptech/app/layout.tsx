import "./globals.css";

export const metadata = {
  title: "Radar PropTech",
  description: "La herramienta definitiva para inmobiliarias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  );
}
