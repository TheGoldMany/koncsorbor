import { prisma } from "@/lib/db";
import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pénztár" };

export default async function CheckoutPage() {
  const shippingMethods = await prisma.shippingMethod.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });

  return (
    <div className="container-kb py-12">
      <h1 className="text-3xl font-bold text-leather-900">Pénztár</h1>
      <CheckoutForm
        shippingMethods={shippingMethods.map((s) => ({ id: s.id, name: s.name, fee: s.fee, note: s.note }))}
      />
    </div>
  );
}
