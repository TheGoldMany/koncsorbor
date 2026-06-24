import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });
  return (
    <>
      <PageHeader
        title="Új termék"
        subtitle="A kivitelek (méret/szín) a létrehozás után adhatók hozzá."
        action={<Link href="/admin/termekek" className="btn-ghost">← Vissza</Link>}
      />
      {categories.length === 0 ? (
        <p className="text-leather-600">
          Előbb hozz létre legalább egy <Link href="/admin/kategoriak" className="underline">kategóriát</Link>.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
