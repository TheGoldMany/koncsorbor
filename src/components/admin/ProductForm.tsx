"use client";

import { useRef, useState } from "react";
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
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "A feltöltés nem sikerült.");
          break;
        }
        setImages((prev) => [...prev, data.url]);
      }
    } catch {
      setError("Hálózati hiba a feltöltés közben.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const u = urlDraft.trim();
    if (!u) return;
    setImages((prev) => [...prev, u]);
    setUrlDraft("");
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  return (
    <form action={saveProduct} className="card space-y-5 p-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      {/* A képek URL-jei soronként — ezt olvassa a mentés */}
      <input type="hidden" name="images" value={images.join("\n")} />

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

      {/* ---------------- Képek ---------------- */}
      <div>
        <label className="label">Termékképek</label>

        {/* Feltöltő terület */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-leather-300 bg-leather-50 px-4 py-8 text-center transition hover:border-leather-400 hover:bg-leather-100"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-leather-500">
            <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-medium text-leather-700">
            {uploading ? "Feltöltés folyamatban…" : "Kattints ide vagy húzd ide a képeket a feltöltéshez"}
          </p>
          <p className="text-xs text-leather-500">JPG, PNG, WebP, GIF vagy AVIF — max. 8 MB / kép</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {/* Előnézet */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="group relative overflow-hidden rounded-lg border border-leather-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Kép ${i + 1}`} className="aspect-square w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-leather-700/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Borító
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/45 p-1 opacity-0 transition group-hover:opacity-100">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} className="rounded px-1.5 text-white hover:bg-white/20" title="Balra">←</button>
                    <button type="button" onClick={() => move(i, 1)} className="rounded px-1.5 text-white hover:bg-white/20" title="Jobbra">→</button>
                  </div>
                  <button type="button" onClick={() => removeImage(i)} className="rounded px-1.5 text-white hover:bg-red-500/80" title="Törlés">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kézi URL hozzáadás */}
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="Vagy illessz be egy kép-URL-t (https://…)"
            className="input flex-1"
          />
          <button type="button" onClick={addUrl} className="btn-ghost whitespace-nowrap">Hozzáadás</button>
        </div>
        <p className="mt-1 text-xs text-leather-500">
          Az első kép lesz a borító. A nyilakkal átrendezheted, az ✕-szel törölheted a képeket.
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
        <button className="btn-primary" disabled={uploading}>
          {product ? "Módosítások mentése" : "Termék létrehozása"}
        </button>
      </div>
    </form>
  );
}
