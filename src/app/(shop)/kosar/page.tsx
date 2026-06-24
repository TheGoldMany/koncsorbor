"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";
import { formatHuf } from "@/lib/money";

export default function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();

  if (!ready) return <div className="container-kb py-20 text-center text-leather-600">Betöltés…</div>;

  if (items.length === 0) {
    return (
      <div className="container-kb py-20 text-center">
        <h1 className="text-3xl font-bold text-leather-900">A kosarad üres</h1>
        <p className="mt-3 text-leather-600">Böngészd kézműves termékeinket, és találd meg a tökéleteset!</p>
        <Link href="/termekek" className="btn-primary mt-6">Termékek megtekintése</Link>
      </div>
    );
  }

  return (
    <div className="container-kb py-12">
      <h1 className="text-3xl font-bold text-leather-900">Kosár</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.variantId} className="card flex gap-4 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-leather-100">
                <ProductImage src={item.image} alt={item.productName} />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <div>
                    <Link href={`/termekek/${item.productSlug}`} className="font-semibold text-leather-900 hover:underline">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-leather-600">{item.variantName}</p>
                  </div>
                  <button onClick={() => remove(item.variantId)} className="text-sm text-leather-500 hover:text-leather-800">
                    Törlés
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-leather-300">
                    <button className="px-3 py-1.5" onClick={() => setQty(item.variantId, item.quantity - 1)}>−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button className="px-3 py-1.5" onClick={() => setQty(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <span className="font-bold text-leather-900">{formatHuf(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-semibold text-leather-900">Összegzés</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-leather-600">Részösszeg</span>
              <span className="font-semibold">{formatHuf(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-leather-600">Szállítás</span>
              <span className="text-leather-600">a pénztárnál</span>
            </div>
            <div className="mt-4 border-t border-leather-200 pt-4 flex justify-between">
              <span className="font-semibold text-leather-900">Részösszeg</span>
              <span className="text-xl font-bold text-leather-900">{formatHuf(subtotal)}</span>
            </div>
            <Link href="/penztar" className="btn-primary mt-6 w-full py-3">Tovább a pénztárhoz</Link>
            <Link href="/termekek" className="mt-3 block text-center text-sm text-leather-600 hover:underline">
              Vásárlás folytatása
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
