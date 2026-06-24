import { saveProduct } from "@/lib/admin-actions";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string | null;
  basePrice: number;
  categoryId: string;
  active: boolean;
  featured: boolean;
  images: { url: string }[];
} | null;

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  return (
    <form action={saveProduct} className="card space-y-5 p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Név *</label>
          <input name="name" required defaultValue={product?.name} className="input" />
        </div>
        <div>
          <label className="label">Egyedi link (slug)</label>
          <input name="slug" defaultValue={product?.slug} className="input" placeholder="auto a névből" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Kategória *</label>
          <select name="categoryId" required defaultValue={product?.categoryId} className="input">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Alapár (Ft, bruttó) *</label>
          <input name="basePrice" type="number" min="0" required defaultValue={product?.basePrice} className="input" />
        </div>
      </div>

      <div>
        <label className="label">Rövid leírás *</label>
        <textarea name="description" required rows={2} defaultValue={product?.description} className="input" />
      </div>

      <div>
        <label className="label">Részletes leírás (soronként új bekezdés)</label>
        <textarea name="details" rows={6} defaultValue={product?.details ?? ""} className="input" />
      </div>

      <div>
        <label className="label">Képek URL-jei (soronként egy)</label>
        <textarea
          name="images"
          rows={3}
          defaultValue={product?.images.map((i) => i.url).join("\n")}
          className="input"
          placeholder="/uploads/termek-1.jpg vagy https://..."
        />
        <p className="mt-1 text-xs text-leather-500">
          Tölts fel képeket a <code>/public/uploads</code> mappába, és add meg az elérési utat (pl. <code>/uploads/nyakorv.jpg</code>), vagy használj külső URL-t.
        </p>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Aktív (látható a boltban)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Kiemelt a főoldalon
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-primary">{product ? "Módosítások mentése" : "Termék létrehozása"}</button>
      </div>
    </form>
  );
}
