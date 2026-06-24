"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Bejelentkezési hiba.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-leather-900">Admin bejelentkezés</h1>
          <p className="mt-1 text-sm text-leather-600">Jelentkezz be a webáruház kezeléséhez.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input name="email" type="email" required className="input" autoComplete="username" />
            </div>
            <div>
              <label className="label">Jelszó</label>
              <input name="password" type="password" required className="input" autoComplete="current-password" />
            </div>
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Belépés…" : "Belépés"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
