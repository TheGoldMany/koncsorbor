import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { saveShipping, deleteShipping } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const methods = await prisma.shippingMethod.findMany({ orderBy: { position: "asc" } });

  return (
    <>
      <PageHeader title="Szállítási módok" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <thead><tr><Th>Név</Th><Th>Díj</Th><Th>Megjegyzés</Th><Th>Aktív</Th><Th></Th></tr></thead>
            <tbody>
              {methods.length === 0 && <tr><Td className="text-leather-500">Nincs szállítási mód.</Td></tr>}
              {methods.map((m) => (
                <tr key={m.id}>
                  <Td>
                    <form action={saveShipping} id={`ship-${m.id}`} className="contents">
                      <input type="hidden" name="id" value={m.id} />
                      <input name="name" defaultValue={m.name} className="input !py-1" />
                    </form>
                  </Td>
                  <Td><input form={`ship-${m.id}`} name="fee" type="number" defaultValue={m.fee} className="input !py-1 w-28" /></Td>
                  <Td><input form={`ship-${m.id}`} name="note" defaultValue={m.note ?? ""} className="input !py-1" /></Td>
                  <Td>
                    <input form={`ship-${m.id}`} type="hidden" name="position" value={m.position} />
                    <label className="flex items-center gap-1 text-sm">
                      <input form={`ship-${m.id}`} type="checkbox" name="active" defaultChecked={m.active} /> aktív
                    </label>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button form={`ship-${m.id}`} className="text-sm font-medium text-leather-700 hover:underline">Mentés</button>
                      <form action={deleteShipping}><input type="hidden" name="id" value={m.id} /><button className="text-sm text-red-600 hover:underline">Törlés</button></form>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-leather-900">Új szállítási mód</h3>
          <form action={saveShipping} className="mt-3 space-y-3">
            <div><label className="label">Név *</label><input name="name" required className="input" placeholder="pl. GLS futárszolgálat" /></div>
            <div><label className="label">Díj (Ft)</label><input name="fee" type="number" defaultValue={1590} className="input" /></div>
            <div><label className="label">Megjegyzés</label><input name="note" className="input" placeholder="pl. 1-3 munkanap" /></div>
            <div><label className="label">Sorrend</label><input name="position" type="number" defaultValue={0} className="input w-24" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> aktív</label>
            <button className="btn-primary w-full">Létrehozás</button>
          </form>
        </div>
      </div>
    </>
  );
}
