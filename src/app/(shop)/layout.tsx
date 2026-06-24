import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCustomerSession } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession();
  return (
    <div className="flex min-h-screen flex-col">
      <Header customer={session ? { name: session.name } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
