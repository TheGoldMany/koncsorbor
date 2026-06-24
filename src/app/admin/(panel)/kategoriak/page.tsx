import { prisma } from "@/lib/db";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { saveCategory, deleteCategory } from "@/lib/admin-actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { position: "asc" },
  });

  return (
    <>
      <PageHeader title="Kategóriák" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <thead>
              <tr><Th>Név</Th><Th>Slug</Th><Th>Termékek</Th><Th>Sorrend</Th><Th></Th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-leather-900">{c.name}</Td>
                  <Td className="text-leather-600">{c.slug}</Td>
                  <Td>{c._count.products}</Td>
                  <Td>{c.position}</Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer text-sm text-leather-700">Szerkeszt</summary>
                      <form action={saveCategory} className="mt-2 space-y-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input name="name" defaultValue={c.name} className="input !py-1" />
                        <input name="slug" defaultValue={c.slug} className="input !py-1" />
                        <input name="description" defaultValue={c.description ?? ""} placeholder="Leírás" className="input !py-1" />
                        <ImageUploadField name="image" defaultValue={c.image} />
                        <input name="position" type="number" defaultValue={c.position} className="input !py-1 w-24" />
                        <div className="flex gap-2">
                          <button className="btn-primary !py-1">Mentés</button>
                        </div>
                      </form>
                      {c._count.products === 0 && (
                        <form action={deleteCategory} className="mt-2">
                          <input type="hidden" name="id" value={c.id} />
                          <button className="text-sm text-red-600 hover:underline">Törlés</button>
                        </form>
                      )}
                    </details>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div>
          <div className="card p-5">
            <h3 className="font-semibold text-leather-900">Új kategória</h3>
            <form action={saveCategory} className="mt-3 space-y-3">
              <div><label className="label">Név *</label><input name="name" required className="input" /></div>
              <div><label className="label">Slug</label><input name="slug" className="input" placeholder="auto a névből" /></div>
              <div><label className="label">Leírás</label><textarea name="description" rows={2} className="input" /></div>
              <div><label className="label">Kép</label><ImageUploadField name="image" /></div>
              <div><label className="label">Sorrend</label><input name="position" type="number" defaultValue={0} className="input w-24" /></div>
              <button className="btn-primary w-full">Létrehozás</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
