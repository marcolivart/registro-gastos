import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuestro Piso",
  description: "Fondo común y gastos de Marc & Alba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}