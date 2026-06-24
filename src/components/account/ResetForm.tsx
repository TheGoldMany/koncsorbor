"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (password !== confirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/fiok/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Hiba történt.");
      setLoading(false);
      return;
    }
    router.push("/fiok");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label className="label">Új jelszó</label>
        <input name="password" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label">Új jelszó megerősítése</label>
        <input name="confirm" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="btn-primary w-full py-2.5">
        {loading ? "Mentés…" : "Új jelszó beállítása"}
      </button>
    </form>
  );
}
