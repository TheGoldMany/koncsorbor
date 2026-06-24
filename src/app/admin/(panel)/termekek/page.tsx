import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { toggleProductActive } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true, images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Termékek"
        subtitle={`${products.length} termék`}
        action={<Link href="/admin/termekek/uj" className="btn-primary">+ Új termék</Link>}
      />
      <Table>
        <thead>
          <tr>
            <Th>Név</Th>
            <Th>Kategória</Th>
            <Th>Ár (alap)</Th>
            <Th>Kivitelek</Th>
            <Th>Készlet</Th>
            <Th>Állapot</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && <tr><Td className="text-leather-500">Még nincs termék.</Td></tr>}
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id} className="hover:bg-leather-50">
                <Td>
                  <Link href={`/admin/termekek/${p.id}`} className="font-medium text-leather-900 hover:underline">
                    {p.name}
                  </Link>
                </Td>
                <Td>{p.category.name}</Td>
                <Td>{formatHuf(p.basePrice)}</Td>
                <Td>{p.variants.length}</Td>
                <Td className={stock <= 2 ? "font-semibold text-red-700" : ""}>{stock} db</Td>
                <Td>
                  <span className={`badge ${p.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                    {p.active ? "Aktív" : "Inaktív"}
                  </span>
                  {p.featured && <span className="badge ml-1 bg-leather-200 text-leather-900">Kiemelt</span>}
                </Td>
                <Td>
                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-sm text-leather-600 hover:underline">
                      {p.active ? "Elrejt" : "Aktivál"}
                    </button>
                  </form>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
