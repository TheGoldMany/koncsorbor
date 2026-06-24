import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveVariant, deleteVariant, deleteProduct } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { priceDiff: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle="Termék szerkesztése"
        action={
          <div className="flex gap-2">
            <Link href={`/termekek/${product.slug}`} target="_blank" className="btn-ghost">↗ Megtekintés</Link>
            <Link href="/admin/termekek" className="btn-ghost">← Vissza</Link>
          </div>
        }
      />

      <ProductForm categories={categories} product={product} />

      {/* Variants */}
      <h2 className="mb-3 mt-10 text-lg font-semibold text-leather-900">Kivitelek (méret / szín)</h2>
      <Table>
        <thead>
          <tr><Th>Megnevezés</Th><Th>Cikkszám</Th><Th>Ár-eltérés</Th><Th>Végső ár</Th><Th>Készlet</Th><Th></Th></tr>
        </thead>
        <tbody>
          {product.variants.map((v) => (
            <tr key={v.id}>
              <Td>
                <form action={saveVariant} className="flex items-center gap-2" id={`var-${v.id}`}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <input name="name" defaultValue={v.name} className="input !py-1" />
                </form>
              </Td>
              <Td><input form={`var-${v.id}`} name="sku" defaultValue={v.sku} className="input !py-1 w-32" /></Td>
              <Td><input form={`var-${v.id}`} name="priceDiff" type="number" defaultValue={v.priceDiff} className="input !py-1 w-24" /></Td>
              <Td className="whitespace-nowrap font-semibold">{formatHuf(product.basePrice + v.priceDiff)}</Td>
              <Td><input form={`var-${v.id}`} name="stock" type="number" defaultValue={v.stock} className="input !py-1 w-20" /></Td>
              <Td>
                <div className="flex gap-2">
                  <button form={`var-${v.id}`} className="text-sm font-medium text-leather-700 hover:underline">Mentés</button>
                  <form action={deleteVariant}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <button className="text-sm text-red-600 hover:underline">Törlés</button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add variant */}
      <form action={saveVariant} className="card mt-4 flex flex-wrap items-end gap-3 p-4">
        <input type="hidden" name="productId" value={product.id} />
        <div>
          <label className="label">Megnevezés</label>
          <input name="name" required placeholder="pl. 3 cm / Fekete" className="input" />
        </div>
        <div>
          <label className="label">Ár-eltérés (Ft)</label>
          <input name="priceDiff" type="number" defaultValue={0} className="input w-28" />
        </div>
        <div>
          <label className="label">Készlet</label>
          <input name="stock" type="number" defaultValue={0} className="input w-24" />
        </div>
        <button className="btn-primary">+ Kivitel hozzáadása</button>
      </form>

      {/* Danger zone */}
      <div className="mt-10 card border-red-200 p-5">
        <h3 className="font-semibold text-red-800">Termék törlése</h3>
        <p className="mt-1 text-sm text-leather-600">A művelet nem vonható vissza.</p>
        <form action={deleteProduct} className="mt-3">
          <input type="hidden" name="id" value={product.id} />
          <button className="btn border border-red-300 text-red-700 hover:bg-red-50">Termék végleges törlése</button>
        </form>
      </div>
    </>
  );
}
