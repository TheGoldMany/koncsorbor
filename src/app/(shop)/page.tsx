import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export const dynamic = "force-dynamic";

async function getData() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { position: "asc" } }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
      take: 6,
    }),
  ]);
  const fallback = featured.length
    ? featured
    : await prisma.product.findMany({
        where: { active: true },
        include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
        take: 6,
      });
  return { categories, featured: fallback };
}

export default async function HomePage() {
  const { categories, featured } = await getData();

  return (
    <>
      {/* Hero */}
      <section className="leather-texture relative text-cream">
        <div className="container-kb grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="badge bg-cream/10 text-leather-100">Est. 2026 · Kézműves bőrdíszmű</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Valódi bőr.
              <br />
              Egy életre szól.
            </h1>
            <p className="mt-5 max-w-md text-lg text-leather-100">
              Kutya nyakörvek, övek és tőrtokok prémium, növényi cserzésű marhabőrből.
              Minden darab gondos kézmunka eredménye, a vadászat és a túrázás szerelmeseinek.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/termekek" className="btn bg-cream text-leather-900 hover:bg-leather-100">
                Termékek böngészése
              </Link>
              <Link href="/rolunk" className="btn border border-cream/40 text-cream hover:bg-cream/10">
                A műhelyről
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-cream/20 shadow-soft">
            <ProductImage src={featured[0]?.images[0]?.url} alt="Koncsor Bőrkereskedés" />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-leather-200 bg-white">
        <div className="container-kb grid gap-6 py-8 text-center sm:grid-cols-3">
          {[
            { t: "Növényi cserzésű marhabőr", d: "3–4 mm vastag, elnyűhetetlen alapanyag" },
            { t: "Kézzel készített", d: "Minden darab egyedi kézmunka" },
            { t: "Egyedi méret", d: "A kedvencedre vagy rád szabva" },
          ].map((f) => (
            <div key={f.t}>
              <p className="font-serif text-lg font-semibold text-leather-900">{f.t}</p>
              <p className="text-sm text-leather-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-kb py-16">
        <h2 className="text-3xl font-bold text-leather-900">Kategóriák</h2>
        <p className="mt-2 text-leather-600">Fedezd fel kézműves termékeinket.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kategoria/${c.slug}`}
              className="card group relative flex aspect-[4/3] flex-col justify-end overflow-hidden"
            >
              <ProductImage src={c.image} alt={c.name} className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
              <div className="relative p-5 text-cream">
                <h3 className="text-xl font-bold">{c.name}</h3>
                {c.description && <p className="mt-1 text-sm text-leather-100 line-clamp-2">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-white py-16">
        <div className="container-kb">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-leather-900">Kiemelt termékek</h2>
              <p className="mt-2 text-leather-600">A műhely legnépszerűbb darabjai.</p>
            </div>
            <Link href="/termekek" className="hidden btn-outline sm:inline-flex">Összes termék</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
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
        </div>
      </section>

      {/* CTA */}
      <section className="container-kb py-16">
        <div className="leather-texture rounded-2xl px-8 py-12 text-center text-cream md:px-16">
          <h2 className="text-3xl font-bold">Egyedi darabot szeretnél?</h2>
          <p className="mx-auto mt-3 max-w-xl text-leather-100">
            Méretre szabott nyakörvek, övek és tőrtokok. Írj nekünk vagy hívj minket bátran,
            és elkészítjük a számodra tökéletes darabot.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="tel:+36709420725" className="btn bg-cream text-leather-900 hover:bg-leather-100">
              📲 06 70 942 0725
            </a>
            <Link href="/kapcsolat" className="btn border border-cream/40 text-cream hover:bg-cream/10">
              Kapcsolat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
