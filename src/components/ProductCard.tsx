import Link from "next/link";
import { formatHuf } from "@/lib/money";
import { ProductImage } from "./ProductImage";

export type ProductCardData = {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string | null;
  categoryName?: string;
  minStock?: number;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const soldOut = p.minStock !== undefined && p.minStock <= 0;
  return (
    <Link
      href={`/termekek/${p.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-leather-100">
        <ProductImage src={p.image} alt={p.name} className="transition-transform duration-500 group-hover:scale-105" />
        {soldOut && (
          <span className="absolute left-3 top-3 badge bg-charcoal text-cream">Elfogyott</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {p.categoryName && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-leather-500">
            {p.categoryName}
          </span>
        )}
        <h3 className="text-lg font-semibold text-leather-900">{p.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-leather-700">{p.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-leather-900">{formatHuf(p.basePrice)}-tól</span>
          <span className="text-sm font-medium text-leather-600 group-hover:underline">Megnézem →</span>
        </div>
      </div>
    </Link>
  );
}
