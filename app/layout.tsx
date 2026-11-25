import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FALLBACK_CATEGORIES, type Category } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: "IslaMercado — Compra y vende en Cuba",
    template: "%s | IslaMercado",
  },
  description:
    "IslaMercado es el marketplace de Cuba: publica gratis, compra y vende en toda la isla. Vehículos, teléfonos, hogar, energía solar y más.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories: Category[] = [...FALLBACK_CATEGORIES];

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
