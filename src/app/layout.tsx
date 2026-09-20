import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORJA — App de Entrenamiento",
  description: "Entrenador + clientes: rutinas, dietas y progreso. Next.js + Neon + Drizzle.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
