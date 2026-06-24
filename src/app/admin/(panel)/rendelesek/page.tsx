import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, StatusBadge, Table, Th, Td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const filters = [
    { key: "", label: "Összes" },
    { key: "pending", label: "Feldolgozás" },
    { key: "paid", label: "Fizetve" },
    { key: "processing", label: "Készítés" },
    { key: "shipped", label: "Kiszállítva" },
    { key: "completed", label: "Teljesítve" },
    { key: "cancelled", label: "Törölve" },
  ];

  return (
    <>
      <PageHeader title="Rendelések" subtitle={`${orders.length} rendelés`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/rendelesek?status=${f.key}` : "/admin/rendelesek"}
            className={`badge border px-3 py-1.5 ${
              (status ?? "") === f.key ? "border-leather-700 bg-leather-700 text-cream" : "border-leather-300 text-leather-800"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Rendelés</Th>
            <Th>Ügyfél</Th>
            <Th>Tételek</Th>
            <Th>Összeg</Th>
            <Th>Fizetés</Th>
            <Th>Állapot</Th>
            <Th>Dátum</Th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr><Td className="text-leather-500">Nincs találat.</Td></tr>
          )}
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-leather-50">
              <Td>
                <Link href={`/admin/rendelesek/${o.id}`} className="font-medium text-leather-900 hover:underline">
                  {o.orderNumber}
                </Link>
              </Td>
              <Td>
                <div className="font-medium text-leather-900">{o.customer.name}</div>
                <div className="text-xs text-leather-500">{o.customer.email}</div>
              </Td>
              <Td>{o.items.reduce((s, i) => s + i.quantity, 0)} db</Td>
              <Td className="font-semibold">{formatHuf(o.total)}</Td>
              <Td><StatusBadge status={o.paymentStatus} /></Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td className="whitespace-nowrap text-leather-600">{formatDateTime(o.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
