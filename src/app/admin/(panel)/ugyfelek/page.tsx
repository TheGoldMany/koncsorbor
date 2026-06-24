import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: { select: { total: true, paymentStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Ügyfelek" subtitle={`${customers.length} ügyfél`} />
      <Table>
        <thead>
          <tr><Th>Név</Th><Th>E-mail</Th><Th>Telefon</Th><Th>Rendelések</Th><Th>Összes költés</Th><Th>Regisztrált</Th></tr>
        </thead>
        <tbody>
          {customers.length === 0 && <tr><Td className="text-leather-500">Még nincs ügyfél.</Td></tr>}
          {customers.map((c) => {
            const spent = c.orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);
            return (
              <tr key={c.id} className="hover:bg-leather-50">
                <Td>
                  <Link href={`/admin/ugyfelek/${c.id}`} className="font-medium text-leather-900 hover:underline">
                    {c.name}
                  </Link>
                </Td>
                <Td className="text-leather-700">{c.email}</Td>
                <Td className="text-leather-700">{c.phone}</Td>
                <Td>{c.orders.length}</Td>
                <Td className="font-semibold">{formatHuf(spent)}</Td>
                <Td className="text-leather-600">{formatDate(c.createdAt)}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
