"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl border border-leather-200 bg-leather-100">
        <ProductImage src={main?.url} alt={main?.alt ?? name} />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                i === active ? "border-leather-700" : "border-leather-200"
              )}
            >
              <ProductImage src={img.url} alt={img.alt} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
