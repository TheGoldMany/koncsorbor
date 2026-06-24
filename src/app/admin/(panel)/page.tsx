import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, StatCard, StatusBadge, Table, Th, Td } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, paidOrders, productCount, customerCount, lowStock, recentOrders, revenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "paid" } }),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.productVariant.findMany({
        where: { stock: { lte: 2 } },
        include: { product: true },
        orderBy: { stock: "asc" },
        take: 6,
      }),
      prisma.order.findMany({
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    ]);

  return (
    <>
      <PageHeader title="Áttekintés" subtitle="A webáruház aktuális állapota." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="revenue" label="Bevétel (fizetett)" value={formatHuf(revenue._sum.total ?? 0)} />
        <StatCard icon="orders" label="Rendelések" value={`${orderCount} (${paidOrders} fizetve)`} href="/admin/rendelesek" />
        <StatCard icon="products" label="Termékek" value={String(productCount)} href="/admin/termekek" />
        <StatCard icon="customers" label="Ügyfelek" value={String(customerCount)} href="/admin/ugyfelek" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-leather-900">Legutóbbi rendelések</h2>
          <Table>
            <thead>
              <tr>
                <Th>Rendelés</Th>
                <Th>Ügyfél</Th>
                <Th>Összeg</Th>
                <Th>Fizetés</Th>
                <Th>Dátum</Th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><Td className="text-leather-500" >Még nincs rendelés.</Td></tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-leather-50">
                  <Td>
                    <Link href={`/admin/rendelesek/${o.id}`} className="font-medium text-leather-900 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </Td>
                  <Td>{o.customer.name}</Td>
                  <Td>{formatHuf(o.total)}</Td>
                  <Td><StatusBadge status={o.paymentStatus} /></Td>
                  <Td className="whitespace-nowrap text-leather-600">{formatDateTime(o.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-leather-900">Alacsony készlet</h2>
          <div className="card divide-y divide-leather-100">
            {lowStock.length === 0 && <p className="p-4 text-sm text-leather-500">Minden termék jól áll.</p>}
            {lowStock.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <p className="font-medium text-leather-900">{v.product.name}</p>
                  <p className="text-leather-500">{v.name}</p>
                </div>
                <span className={`badge ${v.stock <= 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                  {v.stock} db
                </span>
              </div>
            ))}
            <Link href="/admin/keszlet" className="block p-3 text-center text-sm font-medium text-leather-700 hover:underline">
              Készlet kezelése →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
