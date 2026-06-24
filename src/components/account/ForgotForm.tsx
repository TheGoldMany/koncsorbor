"use client";

import { useState } from "react";
import Link from "next/link";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/fiok/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") }),
    });
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <p className="text-leather-800">
          Ha létezik fiók ezzel az e-mail címmel, elküldtük a jelszó-visszaállító linket.
          Kérjük, ellenőrizd a postaládádat (a spam mappát is).
        </p>
        <Link href="/fiok/bejelentkezes" className="btn-outline mt-4">Vissza a bejelentkezéshez</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label className="label">E-mail cím</label>
        <input name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <button disabled={loading} className="btn-primary w-full py-2.5">
        {loading ? "Küldés…" : "Visszaállító link küldése"}
      </button>
      <p className="text-center text-sm">
        <Link href="/fiok/bejelentkezes" className="text-leather-700 hover:underline">Vissza a bejelentkezéshez</Link>
      </p>
    </form>
  );
}
