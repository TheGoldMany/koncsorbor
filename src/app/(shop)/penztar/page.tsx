import Link from "next/link";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pénztár" };

export default async function CheckoutPage() {
  const [shippingMethods, customer] = await Promise.all([
    prisma.shippingMethod.findMany({ where: { active: true }, orderBy: { position: "asc" } }),
    getCurrentCustomer(),
  ]);

  return (
    <div className="container-kb py-12">
      <h1 className="text-3xl font-bold text-leather-900">Pénztár</h1>
      {!customer && (
        <p className="mt-2 text-sm text-leather-600">
          Van már fiókod?{" "}
          <Link href="/fiok/bejelentkezes?next=/penztar" className="font-semibold text-leather-700 underline">
            Jelentkezz be
          </Link>{" "}
          a gyorsabb vásárláshoz, vagy folytasd vendégként.
        </p>
      )}
      <CheckoutForm
        shippingMethods={shippingMethods.map((s) => ({ id: s.id, name: s.name, fee: s.fee, note: s.note }))}
        defaultCustomer={
          customer ? { name: customer.name, email: customer.email, phone: customer.phone ?? "" } : null
        }
      />
    </div>
  );
}
