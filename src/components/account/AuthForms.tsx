"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthForms() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = params.get("next") || "/fiok";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const endpoint = mode === "login" ? "/api/fiok/login" : "/api/fiok/register";
    const payload =
      mode === "login"
        ? { email: fd.get("email"), password: fd.get("password") }
        : {
            name: fd.get("name"),
            email: fd.get("email"),
            phone: fd.get("phone"),
            password: fd.get("password"),
          };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Hiba történt.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex rounded-lg border border-leather-200 p-1">
        <button
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === "login" ? "bg-leather-700 text-cream" : "text-leather-700"}`}
        >
          Bejelentkezés
        </button>
        <button
          onClick={() => { setMode("register"); setError(null); }}
          className={`flex-1 rounded-md py-2 text-sm font-semibold ${mode === "register" ? "bg-leather-700 text-cream" : "text-leather-700"}`}
        >
          Regisztráció
        </button>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        {mode === "register" && (
          <div>
            <label className="label">Teljes név</label>
            <input name="name" required className="input" autoComplete="name" />
          </div>
        )}
        <div>
          <label className="label">E-mail</label>
          <input name="email" type="email" required className="input" autoComplete="email" />
        </div>
        {mode === "register" && (
          <div>
            <label className="label">Telefonszám</label>
            <input name="phone" required className="input" autoComplete="tel" />
          </div>
        )}
        <div>
          <label className="label">Jelszó</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? "Folyamatban…" : mode === "login" ? "Belépés" : "Fiók létrehozása"}
        </button>

        {mode === "login" && (
          <p className="text-center text-sm">
            <Link href="/fiok/elfelejtett-jelszo" className="text-leather-700 hover:underline">
              Elfelejtetted a jelszavad?
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
