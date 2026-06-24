"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Áttekintés", exact: true },
  { href: "/admin/rendelesek", label: "Rendelések" },
  { href: "/admin/termekek", label: "Termékek" },
  { href: "/admin/keszlet", label: "Készlet" },
  { href: "/admin/kategoriak", label: "Kategóriák" },
  { href: "/admin/ugyfelek", label: "Ügyfelek" },
  { href: "/admin/szamlak", label: "Számlák" },
  { href: "/admin/szallitas", label: "Szállítási módok" },
  { href: "/admin/felhasznalok", label: "Felhasználók" },
  { href: "/admin/beallitasok", label: "Beállítások" },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/bejelentkezes");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-leather-50">
      {/* Topbar (mobile) */}
      <div className="flex items-center justify-between border-b border-leather-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-serif font-bold text-leather-900">Koncsor Admin</Link>
        <button onClick={() => setOpen((o) => !o)} className="btn-ghost">☰</button>
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-r border-leather-200 bg-leather-900 text-cream lg:block lg:w-64 lg:shrink-0",
            open ? "block" : "hidden"
          )}
        >
          <div className="hidden p-6 lg:block">
            <Link href="/admin" className="font-serif text-xl font-bold text-cream">Koncsor Admin</Link>
            <p className="mt-1 text-xs text-leather-300">Bőrkereskedés kezelőfelület</p>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-leather-700 text-cream" : "text-leather-200 hover:bg-leather-800"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-leather-800 p-4">
            <p className="text-sm font-medium text-cream">{user.name}</p>
            <p className="truncate text-xs text-leather-300">{user.email}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/" target="_blank" className="text-xs text-leather-300 hover:underline">
                ↗ Webáruház megnyitása
              </Link>
              <button onClick={logout} className="text-left text-xs text-leather-300 hover:underline">
                Kijelentkezés
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
