"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatHuf } from "@/lib/money";

type ShippingMethod = { id: string; name: string; fee: number; note: string | null };

export function CheckoutForm({ shippingMethods }: { shippingMethods: ShippingMethod[] }) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [shippingId, setShippingId] = useState(shippingMethods[0]?.id ?? "");
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedShipping = shippingMethods.find((s) => s.id === shippingId);
  const shippingFee = selectedShipping?.fee ?? 0;
  const total = subtotal + shippingFee;

  if (ready && items.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-leather-600">A kosarad üres.</p>
        <Link href="/termekek" className="btn-primary mt-4">Termékek megtekintése</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      shippingMethodId: shippingId,
      customer: {
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
      },
      shipping: {
        zip: String(fd.get("zip") || ""),
        city: String(fd.get("city") || ""),
        address: String(fd.get("address") || ""),
      },
      billing: {
        sameAsShipping: !billingDifferent,
        name: String(fd.get("billing_name") || ""),
        taxId: String(fd.get("billing_taxid") || ""),
        zip: String(fd.get("billing_zip") || ""),
        city: String(fd.get("billing_city") || ""),
        address: String(fd.get("billing_address") || ""),
      },
      note: String(fd.get("note") || ""),
      acceptTerms: fd.get("terms") === "on",
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Hiba történt a rendelés feldolgozása közben.");
        setSubmitting(false);
        return;
      }
      clear();
      if (data.redirectUrl?.startsWith("http")) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(data.redirectUrl);
      }
    } catch {
      setError("Hálózati hiba. Kérjük, próbáld újra.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        {/* Contact */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-leather-900">Kapcsolattartó</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Teljes név *</label>
              <input name="name" required className="input" autoComplete="name" />
            </div>
            <div>
              <label className="label">E-mail *</label>
              <input name="email" type="email" required className="input" autoComplete="email" />
            </div>
            <div>
              <label className="label">Telefonszám *</label>
              <input name="phone" required className="input" autoComplete="tel" />
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-leather-900">Szállítási cím</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Irányítószám *</label>
              <input name="zip" required className="input" autoComplete="postal-code" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Város *</label>
              <input name="city" required className="input" autoComplete="address-level2" />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Cím (utca, házszám) *</label>
              <input name="address" required className="input" autoComplete="street-address" />
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="card p-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={billingDifferent}
              onChange={(e) => setBillingDifferent(e.target.checked)}
            />
            <span className="font-medium text-leather-900">A számlázási cím eltér a szállításitól</span>
          </label>
          {billingDifferent && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="label">Számlázási név / cégnév *</label>
                <input name="billing_name" className="input" />
              </div>
              <div>
                <label className="label">Adószám (cég esetén)</label>
                <input name="billing_taxid" className="input" />
              </div>
              <div>
                <label className="label">Irányítószám *</label>
                <input name="billing_zip" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Város *</label>
                <input name="billing_city" className="input" />
              </div>
              <div className="sm:col-span-3">
                <label className="label">Cím *</label>
                <input name="billing_address" className="input" />
              </div>
            </div>
          )}
        </section>

        {/* Shipping method */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-leather-900">Szállítási mód</h2>
          <div className="mt-4 space-y-3">
            {shippingMethods.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                  shippingId === m.id ? "border-leather-700 bg-leather-50" : "border-leather-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={shippingId === m.id}
                    onChange={() => setShippingId(m.id)}
                  />
                  <span>
                    <span className="font-medium text-leather-900">{m.name}</span>
                    {m.note && <span className="block text-sm text-leather-600">{m.note}</span>}
                  </span>
                </span>
                <span className="font-semibold text-leather-900">
                  {m.fee === 0 ? "Ingyenes" : formatHuf(m.fee)}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Note */}
        <section className="card p-6">
          <label className="label">Megjegyzés a rendeléshez (opcionális)</label>
          <textarea name="note" rows={3} className="input" placeholder="pl. egyedi méret, nyakbőség…" />
        </section>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24 p-6">
          <h2 className="text-lg font-semibold text-leather-900">Rendelés összegzése</h2>
          <ul className="mt-4 space-y-3 border-b border-leather-200 pb-4">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between text-sm">
                <span className="text-leather-700">
                  {i.productName} <span className="text-leather-500">({i.variantName})</span> × {i.quantity}
                </span>
                <span className="font-medium">{formatHuf(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-leather-600">Részösszeg</span>
              <span className="font-semibold">{formatHuf(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-leather-600">Szállítás</span>
              <span className="font-semibold">{shippingFee === 0 ? "Ingyenes" : formatHuf(shippingFee)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-leather-200 pt-4">
            <span className="font-semibold text-leather-900">Fizetendő</span>
            <span className="text-xl font-bold text-leather-900">{formatHuf(total)}</span>
          </div>

          <label className="mt-5 flex items-start gap-2 text-sm text-leather-700">
            <input type="checkbox" name="terms" required className="mt-0.5" />
            <span>
              Elolvastam és elfogadom az{" "}
              <Link href="/jogi/aszf" target="_blank" className="underline">ÁSZF-et</Link> és az{" "}
              <Link href="/jogi/adatvedelem" target="_blank" className="underline">adatkezelési tájékoztatót</Link>.
            </span>
          </label>

          {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={submitting || !shippingId} className="btn-primary mt-5 w-full py-3">
            {submitting ? "Feldolgozás…" : "Fizetés és rendelés"}
          </button>
          <p className="mt-3 text-center text-xs text-leather-500">
            Biztonságos fizetés az OTP SimplePay rendszerén keresztül.
          </p>
        </div>
      </div>
    </form>
  );
}
