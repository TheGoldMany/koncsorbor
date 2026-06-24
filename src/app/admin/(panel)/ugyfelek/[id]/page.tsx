import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, StatusBadge, Table, Th, Td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } },
  });
  if (!customer) notFound();

  const spent = customer.orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0);

  return (
    <>
      <PageHeader
        title={customer.name}
        subtitle={customer.email}
        action={<Link href="/admin/ugyfelek" className="btn-ghost">← Vissza</Link>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-sm text-leather-600">Telefon</p><p className="font-semibold">{customer.phone}</p></div>
        <div className="card p-5"><p className="text-sm text-leather-600">Rendelések</p><p className="font-semibold">{customer.orders.length}</p></div>
        <div className="card p-5"><p className="text-sm text-leather-600">Összes költés</p><p className="font-semibold">{formatHuf(spent)}</p></div>
      </div>

      <Table>
        <thead>
          <tr><Th>Rendelés</Th><Th>Tételek</Th><Th>Összeg</Th><Th>Fizetés</Th><Th>Dátum</Th></tr>
        </thead>
        <tbody>
          {customer.orders.map((o) => (
            <tr key={o.id} className="hover:bg-leather-50">
              <Td><Link href={`/admin/rendelesek/${o.id}`} className="font-medium text-leather-900 hover:underline">{o.orderNumber}</Link></Td>
              <Td>{o.items.reduce((s, i) => s + i.quantity, 0)} db</Td>
              <Td className="font-semibold">{formatHuf(o.total)}</Td>
              <Td><StatusBadge status={o.paymentStatus} /></Td>
              <Td className="text-leather-600">{formatDateTime(o.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
