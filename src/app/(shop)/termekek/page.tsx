import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Összes termék" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const { kategoria } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  const products = await prisma.product.findMany({
    where: { active: true, ...(kategoria ? { category: { slug: kategoria } } : {}) },
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-kb py-12">
      <h1 className="text-3xl font-bold text-leather-900">Termékek</h1>
      <p className="mt-2 text-leather-600">Kézműves bőrdíszművek prémium marhabőrből.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/termekek"
          className={`badge border px-3 py-1.5 ${!kategoria ? "border-leather-700 bg-leather-700 text-cream" : "border-leather-300 text-leather-800"}`}
        >
          Összes
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/termekek?kategoria=${c.slug}`}
            className={`badge border px-3 py-1.5 ${kategoria === c.slug ? "border-leather-700 bg-leather-700 text-cream" : "border-leather-300 text-leather-800"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="mt-12 text-leather-600">Jelenleg nincs elérhető termék ebben a kategóriában.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const minPrice = p.variants.length
              ? Math.min(...p.variants.map((v) => p.basePrice + v.priceDiff))
              : p.basePrice;
            const minStock = p.variants.length ? Math.max(...p.variants.map((v) => v.stock)) : 0;
            return (
              <ProductCard
                key={p.id}
                p={{
                  slug: p.slug,
                  name: p.name,
                  description: p.description,
                  basePrice: minPrice,
                  image: p.images[0]?.url,
                  categoryName: p.category.name,
                  minStock,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
