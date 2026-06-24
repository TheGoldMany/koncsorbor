import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, StatusBadge, Table, Th, Td } from "@/components/admin/ui";
import {
  updateOrderStatus,
  markPaidAction,
  generateInvoiceAction,
} from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true, invoice: true },
  });
  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`Rendelés ${order.orderNumber}`}
        subtitle={formatDateTime(order.createdAt)}
        action={<Link href="/admin/rendelesek" className="btn-ghost">← Vissza</Link>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Table>
            <thead>
              <tr><Th>Termék</Th><Th>Egységár</Th><Th>Menny.</Th><Th>Összeg</Th></tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id}>
                  <Td>
                    <div className="font-medium text-leather-900">{it.productName}</div>
                    <div className="text-xs text-leather-500">{it.variantName}</div>
                  </Td>
                  <Td>{formatHuf(it.unitPrice)}</Td>
                  <Td>{it.quantity}</Td>
                  <Td className="font-semibold">{formatHuf(it.lineTotal)}</Td>
                </tr>
              ))}
              <tr>
                <Td className="text-right" ></Td>
                <Td></Td>
                <Td className="text-leather-600">Szállítás</Td>
                <Td>{order.shippingFee === 0 ? "Ingyenes" : formatHuf(order.shippingFee)}</Td>
              </tr>
              <tr>
                <Td></Td><Td></Td>
                <Td className="font-bold text-leather-900">Összesen</Td>
                <Td className="text-lg font-bold text-leather-900">{formatHuf(order.total)}</Td>
              </tr>
            </tbody>
          </Table>

          {order.note && (
            <div className="card p-5">
              <h3 className="font-semibold text-leather-900">Megjegyzés</h3>
              <p className="mt-1 text-sm text-leather-700">{order.note}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Status + payment */}
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
            </div>

            <form action={updateOrderStatus} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <label className="label">Állapot módosítása</label>
              <select name="status" defaultValue={order.status} className="input">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-leather-700">
                <input type="checkbox" name="notify" /> Ügyfél értesítése e-mailben
              </label>
              <button className="btn-primary w-full">Mentés</button>
            </form>

            {order.paymentStatus !== "paid" && (
              <form action={markPaidAction} className="mt-3">
                <input type="hidden" name="id" value={order.id} />
                <button className="btn-outline w-full">Fizetettnek jelölés (manuális)</button>
              </form>
            )}
          </div>

          {/* Invoice */}
          <div className="card p-5">
            <h3 className="font-semibold text-leather-900">Számla</h3>
            {order.invoice ? (
              <div className="mt-2 text-sm">
                <p className="text-leather-700">Sorszám: <strong>{order.invoice.number}</strong></p>
                <a href={`/szamla/${order.invoice.number}`} target="_blank" className="btn-outline mt-3 w-full">
                  Számla megnyitása
                </a>
              </div>
            ) : (
              <form action={generateInvoiceAction} className="mt-2">
                <input type="hidden" name="id" value={order.id} />
                <button className="btn-outline w-full">Számla generálása</button>
              </form>
            )}
          </div>

          {/* Customer + shipping */}
          <div className="card space-y-4 p-5 text-sm">
            <div>
              <h3 className="font-semibold text-leather-900">Ügyfél</h3>
              <p className="text-leather-700">{order.customer.name}</p>
              <p className="text-leather-700">{order.customer.email}</p>
              <p className="text-leather-700">{order.shippingPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-leather-900">Szállítási cím</h3>
              <p className="text-leather-700">{order.shippingName}</p>
              <p className="text-leather-700">{order.shippingZip} {order.shippingCity}</p>
              <p className="text-leather-700">{order.shippingAddress}</p>
              <p className="text-leather-600">Mód: {order.shippingMethod}</p>
            </div>
            <div>
              <h3 className="font-semibold text-leather-900">Számlázási adatok</h3>
              <p className="text-leather-700">{order.billingName}</p>
              {order.billingTaxId && <p className="text-leather-700">Adószám: {order.billingTaxId}</p>}
              <p className="text-leather-700">{order.billingZip} {order.billingCity}</p>
              <p className="text-leather-700">{order.billingAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
