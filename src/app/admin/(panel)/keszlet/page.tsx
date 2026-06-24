import { prisma } from "@/lib/db";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { updateStock } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { include: { category: true } } },
    orderBy: [{ stock: "asc" }],
  });

  return (
    <>
      <PageHeader title="Készlet" subtitle="Gyors készletmódosítás kivitelenként." />
      <Table>
        <thead>
          <tr><Th>Termék</Th><Th>Kivitel</Th><Th>Kategória</Th><Th>Cikkszám</Th><Th>Készlet</Th><Th></Th></tr>
        </thead>
        <tbody>
          {variants.length === 0 && <tr><Td className="text-leather-500">Nincs kivitel.</Td></tr>}
          {variants.map((v) => (
            <tr key={v.id} className={v.stock <= 2 ? "bg-amber-50/50" : ""}>
              <Td className="font-medium text-leather-900">{v.product.name}</Td>
              <Td>{v.name}</Td>
              <Td className="text-leather-600">{v.product.category.name}</Td>
              <Td className="text-leather-600">{v.sku}</Td>
              <Td>
                <form action={updateStock} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={v.id} />
                  <input name="stock" type="number" defaultValue={v.stock} className="input !py-1 w-24" />
                  <button className="text-sm font-medium text-leather-700 hover:underline">Mentés</button>
                </form>
              </Td>
              <Td>
                {v.stock <= 0 ? (
                  <span className="badge bg-red-100 text-red-800">Elfogyott</span>
                ) : v.stock <= 2 ? (
                  <span className="badge bg-amber-100 text-amber-800">Alacsony</span>
                ) : (
                  <span className="badge bg-green-100 text-green-800">Raktáron</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
