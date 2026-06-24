"use client";

import { useRef, useState } from "react";

// Egyetlen kép feltöltése (pl. kategória borító). A tényleges értéket egy
// rejtett mező hordozza a megadott `name` néven, így sima <form action=...>
// szerver action is megkapja. Feltöltés a /api/admin/upload végponton át.
export function ImageUploadField({
  name = "image",
  defaultValue = "",
}: {
  name?: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "A feltöltés nem sikerült.");
        return;
      }
      setUrl(data.url);
    } catch {
      setError("Hálózati hiba a feltöltés közben.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-leather-200 bg-leather-50">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-leather-400">nincs kép</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost !py-1 text-sm"
            disabled={uploading}
          >
            {uploading ? "Feltöltés…" : url ? "Csere" : "Kép feltöltése"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="text-sm text-red-600 hover:underline">
              Törlés
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="vagy kép-URL (https://…)"
        className="input !py-1 mt-2"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
