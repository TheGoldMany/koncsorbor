"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

const nav: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: "/admin", label: "Áttekintés", icon: "dashboard", exact: true },
  { href: "/admin/rendelesek", label: "Rendelések", icon: "orders" },
  { href: "/admin/termekek", label: "Termékek", icon: "products" },
  { href: "/admin/keszlet", label: "Készlet", icon: "stock" },
  { href: "/admin/kategoriak", label: "Kategóriák", icon: "categories" },
  { href: "/admin/ugyfelek", label: "Ügyfelek", icon: "customers" },
  { href: "/admin/szamlak", label: "Számlák", icon: "invoices" },
  { href: "/admin/szallitas", label: "Szállítási módok", icon: "shipping" },
  { href: "/admin/felhasznalok", label: "Felhasználók", icon: "users" },
  { href: "/admin/beallitasok", label: "Beállítások", icon: "settings" },
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

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-leather-600 font-serif text-lg font-bold text-cream">
            K
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base font-bold text-cream">Koncsor Admin</span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-leather-300">
              Kezelőfelület
            </span>
          </span>
        </Link>
      </div>

      <p className="px-6 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-leather-400">
        Menü
      </p>
      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-leather-700/80 text-cream shadow-sm"
                  : "text-leather-200 hover:bg-leather-800/60 hover:text-cream"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-leather-300" />
              )}
              <Icon name={n.icon} className={cn("h-[18px] w-[18px]", active ? "text-leather-100" : "text-leather-400 group-hover:text-leather-200")} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl bg-leather-950/40 p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leather-600 text-xs font-bold text-cream">
            {initials || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream">{user.name}</p>
            <p className="truncate text-xs text-leather-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-leather-300 transition-colors hover:bg-leather-800/60 hover:text-cream"
          >
            <Icon name="external" className="h-4 w-4" /> Webáruház megnyitása
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-leather-300 transition-colors hover:bg-leather-800/60 hover:text-cream"
          >
            <Icon name="logout" className="h-4 w-4" /> Kijelentkezés
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f1ec]">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-leather-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-leather-600 font-serif text-sm font-bold text-cream">K</span>
          <span className="font-serif font-bold text-leather-900">Koncsor Admin</span>
        </Link>
        <button onClick={() => setOpen((o) => !o)} className="rounded-md p-2 text-leather-700 hover:bg-leather-100" aria-label="Menü">
          <Icon name="menu" />
        </button>
      </div>

      <div className="lg:flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-gradient-to-b from-leather-900 to-leather-950 lg:block">
          {SidebarContent}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-leather-900 to-leather-950 lg:hidden">
              {SidebarContent}
            </aside>
          </>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
