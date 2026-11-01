import type { Metadata } from "next";
import { Mukta, Yatra_One } from "next/font/google";
import { CartProvider } from "@/components/cart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, type MenuPiece } from "@/components/site-header";
import { getProducts } from "@/lib/catalog";
import { paymentsEnabled } from "@/lib/razorpay";
import { SECTIONS, circleCrop, type SectionKey } from "@/lib/store";
import "./globals.css";

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

const yatra = Yatra_One({
  variable: "--font-yatra",
  subsets: ["latin", "devanagari"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Maithilika — Painted by hand. Worn like a story.",
    template: "%s · Maithilika",
  },
  description: "Hand-painted Mithila art: sarees, dupattas, paintings, home decor and accessories, each painted line by line by a Mithila artist.",
  // Private preview: keep search engines out until launch (docs/plan.md).
  robots: { index: false, follow: false },
};

async function menuPieces(): Promise<Record<SectionKey, MenuPiece[]>> {
  const products = await getProducts();
  const entries = SECTIONS.map((s) => [
    s.key,
    s.featured
      .map((id) => products.find((p) => p.id === id))
      .filter((p) => p !== undefined)
      .map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image, crop: circleCrop(p) })),
  ]);
  return Object.fromEntries(entries);
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mukta.variable} ${yatra.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader featured={await menuPieces()} paymentsEnabled={paymentsEnabled()} />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
