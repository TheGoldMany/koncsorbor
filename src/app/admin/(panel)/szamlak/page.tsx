import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { order: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Számlák" subtitle={`${invoices.length} kiállított számla`} />
      <Table>
        <thead>
          <tr><Th>Sorszám</Th><Th>Vevő</Th><Th>Rendelés</Th><Th>Nettó</Th><Th>ÁFA</Th><Th>Bruttó</Th><Th>Kelt</Th><Th></Th></tr>
        </thead>
        <tbody>
          {invoices.length === 0 && <tr><Td className="text-leather-500">Még nincs számla.</Td></tr>}
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-leather-50">
              <Td className="font-medium text-leather-900">{inv.number}</Td>
              <Td>{inv.buyerName}</Td>
              <Td><Link href={`/admin/rendelesek/${inv.orderId}`} className="text-leather-700 hover:underline">{inv.order.orderNumber}</Link></Td>
              <Td>{formatHuf(inv.netAmount)}</Td>
              <Td>{formatHuf(inv.vatAmount)}</Td>
              <Td className="font-semibold">{formatHuf(inv.total)}</Td>
              <Td className="text-leather-600">{formatDate(inv.issuedAt)}</Td>
              <Td><a href={`/szamla/${inv.number}`} target="_blank" className="text-sm font-medium text-leather-700 hover:underline">Megnyitás</a></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
