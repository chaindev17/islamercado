import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SWRegister from "@/components/SWRegister";
import { FALLBACK_CATEGORIES, type Category } from "@/lib/constants";

export const viewport: Viewport = {
  themeColor: "#fbf3e4",
};

export const metadata: Metadata = {
  title: {
    default: "IslaMercado — Compra y vende en Cuba",
    template: "%s | IslaMercado",
  },
  description:
    "IslaMercado es el marketplace de Cuba: publica gratis, compra y vende en toda la isla. Vehículos, teléfonos, hogar, energía solar y más.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IslaMercado",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories: Category[] = [...FALLBACK_CATEGORIES];

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <SWRegister />
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
