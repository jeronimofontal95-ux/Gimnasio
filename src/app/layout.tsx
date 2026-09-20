import type { Metadata } from "next";
import "./globals.css";
import { Anton, Inter, Permanent_Marker } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-marker" });

export const metadata: Metadata = {
  title: "FORJA — App de Entrenamiento",
  description: "Tu entrenador, tu rutina, tu progreso: rutinas, dietas y seguimiento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("dark h-full antialiased", inter.variable, anton.variable, marker.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
