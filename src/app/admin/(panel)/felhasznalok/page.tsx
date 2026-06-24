import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { createUser, deleteUser, resetUserPassword } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <PageHeader title="Felhasználók" subtitle="Admin hozzáférések kezelése." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <thead><tr><Th>Név</Th><Th>E-mail</Th><Th>Szerep</Th><Th>Létrehozva</Th><Th></Th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium text-leather-900">{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td><span className="badge bg-leather-100 text-leather-800">{u.role}</span></Td>
                  <Td className="text-leather-600">{formatDate(u.createdAt)}</Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer text-sm text-leather-700">Kezelés</summary>
                      <form action={resetUserPassword} className="mt-2 flex gap-2">
                        <input type="hidden" name="id" value={u.id} />
                        <input name="password" type="password" placeholder="Új jelszó" className="input !py-1" />
                        <button className="btn-outline !py-1">Jelszó</button>
                      </form>
                      {users.length > 1 && (
                        <form action={deleteUser} className="mt-2">
                          <input type="hidden" name="id" value={u.id} />
                          <button className="text-sm text-red-600 hover:underline">Felhasználó törlése</button>
                        </form>
                      )}
                    </details>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-leather-900">Új felhasználó</h3>
          <form action={createUser} className="mt-3 space-y-3">
            <div><label className="label">Név *</label><input name="name" required className="input" /></div>
            <div><label className="label">E-mail *</label><input name="email" type="email" required className="input" /></div>
            <div><label className="label">Jelszó *</label><input name="password" type="password" required className="input" /></div>
            <div>
              <label className="label">Szerep</label>
              <select name="role" className="input"><option value="admin">admin</option><option value="staff">staff</option></select>
            </div>
            <button className="btn-primary w-full">Létrehozás</button>
          </form>
        </div>
      </div>
    </>
  );
}
