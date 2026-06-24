"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatHuf } from "@/lib/money";
import { cn } from "@/lib/utils";

export type VariantOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export function AddToCart({
  productSlug,
  productName,
  image,
  variants,
}: {
  productSlug: string;
  productName: string;
  image?: string | null;
  variants: VariantOption[];
}) {
  const { add } = useCart();
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
  const [selectedId, setSelectedId] = useState(firstAvailable?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId);
  const canBuy = selected && selected.stock > 0;

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    add(
      {
        variantId: selected.id,
        productSlug,
        productName,
        variantName: selected.name,
        unitPrice: selected.price,
        image,
        maxStock: selected.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-5">
      <div className="text-3xl font-bold text-leather-900">
        {selected ? formatHuf(selected.price) : "—"}
      </div>

      {variants.length > 1 && (
        <div>
          <span className="label">Választható kivitel</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const disabled = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !disabled && setSelectedId(v.id)}
                  disabled={disabled}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    v.id === selectedId
                      ? "border-leather-700 bg-leather-700 text-cream"
                      : "border-leather-300 text-leather-800 hover:border-leather-600",
                    disabled && "cursor-not-allowed border-leather-200 text-leather-300 line-through"
                  )}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <span className="label">Mennyiség</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-leather-300">
            <button type="button" className="px-3 py-2 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              className="px-3 py-2 text-lg"
              onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
            >
              +
            </button>
          </div>
          {selected && (
            <span className="text-sm text-leather-600">
              {selected.stock > 0 ? `${selected.stock} db raktáron` : "Jelenleg nincs raktáron"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={handleAdd} disabled={!canBuy} className="btn-primary flex-1 py-3 text-base">
          {added ? "✓ Kosárba téve" : "Kosárba"}
        </button>
        <Link href="/kosar" className="btn-outline py-3 text-base">
          Kosár megtekintése
        </Link>
      </div>

      {!canBuy && (
        <p className="text-sm text-leather-600">
          Ez a kivitel jelenleg nem elérhető. Egyedi rendelésért hívj minket:{" "}
          <a href="tel:+36709420725" className="font-semibold underline">06 70 942 0725</a>
        </p>
      )}
    </div>
  );
}
