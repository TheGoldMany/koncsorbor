import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { formatHuf } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui";
import { updateProfile } from "@/lib/account-actions";
import { LogoutButton, ChangePasswordForm, DeleteAccountForm } from "@/components/account/AccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fiókom" };

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/fiok/bejelentkezes?next=/fiok");

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: true, invoice: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-kb max-w-4xl py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-leather-900">Üdv, {customer.name}!</h1>
          <p className="text-leather-600">{customer.email}</p>
        </div>
        <LogoutButton />
      </div>

      {/* Orders */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-leather-900">Rendeléseim</h2>
        {orders.length === 0 ? (
          <div className="card p-6 text-leather-600">
            Még nincs rendelésed.{" "}
            <Link href="/termekek" className="font-semibold text-leather-700 underline">Vásárlás</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-leather-900">{o.orderNumber}</p>
                    <p className="text-sm text-leather-600">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <StatusBadge status={o.paymentStatus} />
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-leather-700">
                  {o.items.map((it) => (
                    <li key={it.id}>
                      {it.productName} <span className="text-leather-500">({it.variantName})</span> × {it.quantity}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-leather-100 pt-3">
                  <span className="font-bold text-leather-900">{formatHuf(o.total)}</span>
                  {o.invoice && (
                    <a href={`/szamla/${o.invoice.number}`} target="_blank" className="text-sm font-medium text-leather-700 underline">
                      Számla
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-leather-900">Adataim</h2>
        <form action={updateProfile} className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Teljes név</label>
              <input name="name" defaultValue={customer.name} required className="input" />
            </div>
            <div>
              <label className="label">Telefonszám</label>
              <input name="phone" defaultValue={customer.phone ?? ""} className="input" />
            </div>
          </div>
          <div>
            <label className="label">E-mail (nem módosítható)</label>
            <input value={customer.email} disabled className="input bg-leather-50" />
          </div>
          <button className="btn-primary">Adatok mentése</button>
        </form>
      </section>

      {/* Password */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-leather-900">Jelszó módosítása</h2>
        <div className="card p-6">
          <ChangePasswordForm />
        </div>
      </section>

      {/* Delete */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-red-800">Fiók törlése</h2>
        <div className="card border-red-200 p-6">
          <DeleteAccountForm />
        </div>
      </section>
    </div>
  );
}
