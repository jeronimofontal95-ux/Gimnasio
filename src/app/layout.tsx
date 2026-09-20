import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "FORJA — App de Entrenamiento",
  description: "Tu entrenador, tu rutina, tu progreso: rutinas, dietas y seguimiento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("dark h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
