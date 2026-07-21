import type { Metadata } from "next";
import "./globals.css";
import { RecurringPaymentsGenerator } from "@/components/shared/RecurringPaymentsGenerator";

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
      <body>
        <RecurringPaymentsGenerator />
        {children}
      </body>
    </html>
  );
}