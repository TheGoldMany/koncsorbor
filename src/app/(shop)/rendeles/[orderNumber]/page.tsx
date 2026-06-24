import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rendelés" };

const statusLabels: Record<string, string> = {
  pending: "Feldolgozás alatt",
  paid: "Fizetve",
  processing: "Készítés alatt",
  shipped: "Kiszállítva",
  completed: "Teljesítve",
  cancelled: "Törölve",
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ manual?: string; payment?: string }>;
}) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, customer: true, invoice: true },
  });
  if (!order) notFound();

  const paid = order.paymentStatus === "paid";
  const failed = sp.payment === "failed" || order.paymentStatus === "failed";

  return (
    <div className="container-kb max-w-3xl py-14">
      <div className="text-center">
        {paid ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
        ) : failed ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">!</div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leather-100 text-3xl">⏳</div>
        )}
        <h1 className="mt-4 text-3xl font-bold text-leather-900">
          {paid ? "Köszönjük a rendelésed!" : failed ? "A fizetés sikertelen" : "Rendelés rögzítve"}
        </h1>
        <p className="mt-2 text-leather-600">
          {paid
            ? "A fizetés sikeresen megtörtént. Hamarosan e-mailben is megerősítjük."
            : failed
            ? "A fizetés nem sikerült. Próbáld újra, vagy keress minket telefonon."
            : sp.manual
            ? "A rendelésed rögzítettük. Munkatársunk hamarosan felveszi veled a kapcsolatot a fizetés egyeztetéséhez."
            : "A rendelésed feldolgozás alatt áll."}
        </p>
      </div>

      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-leather-200 pb-4">
          <div>
            <p className="text-sm text-leather-600">Rendelésszám</p>
            <p className="font-bold text-leather-900">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-leather-600">Állapot</p>
            <p className="font-semibold text-leather-900">{statusLabels[order.status] ?? order.status}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between text-sm">
              <span className="text-leather-700">
                {it.productName} <span className="text-leather-500">({it.variantName})</span> × {it.quantity}
              </span>
              <span className="font-medium">{formatHuf(it.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1 border-t border-leather-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-leather-600">Részösszeg</span>
            <span>{formatHuf(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-leather-600">Szállítás ({order.shippingMethod})</span>
            <span>{order.shippingFee === 0 ? "Ingyenes" : formatHuf(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold text-leather-900">
            <span>Összesen</span>
            <span>{formatHuf(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-leather-200 pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-leather-900">Szállítási cím</p>
            <p className="text-leather-700">{order.shippingName}</p>
            <p className="text-leather-700">{order.shippingZip} {order.shippingCity}</p>
            <p className="text-leather-700">{order.shippingAddress}</p>
            <p className="text-leather-700">{order.shippingPhone}</p>
          </div>
          <div>
            <p className="font-semibold text-leather-900">Rendelés időpontja</p>
            <p className="text-leather-700">{formatDateTime(order.createdAt)}</p>
            {order.invoice && (
              <p className="mt-2">
                <Link href={`/szamla/${order.invoice.number}`} className="font-semibold text-leather-700 underline">
                  Számla megtekintése
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/termekek" className="btn-primary">Vásárlás folytatása</Link>
        {failed && (
          <Link href="/kapcsolat" className="btn-outline">Kapcsolatfelvétel</Link>
        )}
      </div>
    </div>
  );
}
