import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import { AuthForms } from "@/components/account/AuthForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bejelentkezés / Regisztráció" };

export default async function LoginPage() {
  const session = await getCustomerSession();
  if (session) redirect("/fiok");

  return (
    <div className="container-kb py-14">
      <h1 className="mb-2 text-center text-3xl font-bold text-leather-900">Fiók</h1>
      <p className="mb-8 text-center text-leather-600">
        Jelentkezz be, vagy hozz létre fiókot a gyorsabb vásárláshoz és a rendeléseid követéséhez.
      </p>
      <Suspense fallback={<div className="text-center text-leather-600">Betöltés…</div>}>
        <AuthForms />
      </Suspense>
    </div>
  );
}
