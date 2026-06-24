import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await prisma.category.findUnique({ where: { slug } });
  return { title: c?.name ?? "Kategória" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="container-kb py-12">
      <h1 className="text-3xl font-bold text-leather-900">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-leather-600">{category.description}</p>}

      {category.products.length === 0 ? (
        <p className="mt-12 text-leather-600">Jelenleg nincs elérhető termék ebben a kategóriában.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((p) => {
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
