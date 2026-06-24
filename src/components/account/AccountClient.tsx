"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteAccount, type ActionResult } from "@/lib/account-actions";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/fiok/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-outline">
      Kijelentkezés
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(changePassword, {});
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label">Jelenlegi jelszó</label>
        <input name="current" type="password" required className="input" autoComplete="current-password" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Új jelszó</label>
          <input name="next" type="password" required minLength={6} className="input" autoComplete="new-password" />
        </div>
        <div>
          <label className="label">Új jelszó megerősítése</label>
          <input name="confirm" type="password" required minLength={6} className="input" autoComplete="new-password" />
        </div>
      </div>
      {state.error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state.ok && state.message && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{state.message}</p>}
      <button disabled={pending} className="btn-primary">
        {pending ? "Mentés…" : "Jelszó módosítása"}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="btn border border-red-300 text-red-700 hover:bg-red-50">
          Fiók törlése
        </button>
      ) : (
        <form action={deleteAccount} className="space-y-3">
          <p className="text-sm text-leather-700">
            A fiók törlése végleges. A korábbi rendeléseidhez tartozó számlák a jogszabályi
            kötelezettség miatt megmaradnak, de a személyes adataidat anonimizáljuk.
          </p>
          <p className="text-sm text-leather-700">
            A megerősítéshez írd be: <strong>TÖRLÉS</strong>
          </p>
          <input name="confirm" required placeholder="TÖRLÉS" className="input max-w-xs" />
          <div className="flex gap-2">
            <button className="btn border border-red-400 bg-red-600 text-white hover:bg-red-700">
              Végleges törlés
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Mégse</button>
          </div>
        </form>
      )}
    </div>
  );
}
