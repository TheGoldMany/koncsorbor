import Link from "next/link";
import { ResetForm } from "@/components/account/ResetForm";

export const metadata = { title: "Új jelszó beállítása" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="container-kb max-w-md py-14">
      <h1 className="mb-2 text-3xl font-bold text-leather-900">Új jelszó beállítása</h1>
      {token ? (
        <>
          <p className="mb-6 text-leather-600">Add meg az új jelszavadat.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <div className="card p-6">
          <p className="text-leather-700">Hiányzó vagy érvénytelen visszaállító link.</p>
          <Link href="/fiok/elfelejtett-jelszo" className="btn-outline mt-4">Új link kérése</Link>
        </div>
      )}
    </div>
  );
}
