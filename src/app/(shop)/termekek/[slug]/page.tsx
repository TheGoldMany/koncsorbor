import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductImage } from "@/components/ProductImage";
import { AddToCart } from "@/components/AddToCart";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  return { title: p?.name ?? "Termék" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { priceDiff: "asc" } },
    },
  });
  if (!product || !product.active) notFound();

  const variantOptions = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    price: product.basePrice + v.priceDiff,
    stock: v.stock,
  }));

  const related = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 3,
  });

  return (
    <div className="container-kb py-10">
      <nav className="mb-6 text-sm text-leather-600">
        <Link href="/" className="hover:underline">Főoldal</Link> <span className="px-1">/</span>
        <Link href={`/kategoria/${product.category.slug}`} className="hover:underline">{product.category.name}</Link>{" "}
        <span className="px-1">/</span> <span className="text-leather-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name }))} name={product.name} />

        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-leather-500">{product.category.name}</span>
          <h1 className="mt-1 text-3xl font-bold text-leather-900">{product.name}</h1>
          <p className="mt-3 text-leather-700">{product.description}</p>

          <div className="mt-6">
            <AddToCart
              productSlug={product.slug}
              productName={product.name}
              image={product.images[0]?.url}
              variants={variantOptions}
            />
          </div>

          {product.details && (
            <div className="prose-kb mt-8 border-t border-leather-200 pt-6 text-leather-800">
              {product.details.split("\n").map((line, i) =>
                line.trim() ? <p key={i}>{line}</p> : null
              )}
            </div>
          )}

          <div className="mt-8 rounded-lg border border-leather-200 bg-white p-4 text-sm text-leather-700">
            <p className="font-semibold text-leather-900">Egyedi méret vagy kérdés?</p>
            <p className="mt-1">
              Hívj minket: <a href="tel:+36709420725" className="font-semibold underline">06 70 942 0725</a> vagy írj a{" "}
              <Link href="/kapcsolat" className="font-semibold underline">kapcsolat</Link> oldalon.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-leather-900">Hasonló termékek</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/termekek/${r.slug}`} className="card group overflow-hidden">
                <div className="aspect-square overflow-hidden bg-leather-100">
                  <ProductImage src={r.images[0]?.url} alt={r.name} className="transition-transform group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-leather-900">{r.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
