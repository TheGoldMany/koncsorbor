import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: {
    default: "Koncsor Bőrkereskedés – Kézműves bőrdíszművek",
    template: "%s | Koncsor Bőrkereskedés",
  },
  description:
    "Kézműves bőr kutya nyakörvek, övek és tőrtokok valódi, növényi cserzésű marhabőrből. Prémium minőség, egy életre.",
  openGraph: {
    title: "Koncsor Bőrkereskedés",
    description: "Kézműves bőrdíszművek prémium marhabőrből.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
