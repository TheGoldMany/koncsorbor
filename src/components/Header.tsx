"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";

const nav = [
  { href: "/termekek", label: "Termékek" },
  { href: "/kategoria/kutya-nyakorvek", label: "Nyakörvek" },
  { href: "/kategoria/ovek", label: "Övek" },
  { href: "/kategoria/tortokok", label: "Tőrtokok" },
  { href: "/rolunk", label: "Rólunk" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-leather-200 bg-cream/95 backdrop-blur">
      <div className="container-kb flex h-20 items-center justify-between">
        <Link href="/" aria-label="Koncsor Bőrkereskedés főoldal">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-leather-800 transition-colors hover:text-leather-950"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/kosar" className="relative btn-ghost" aria-label="Kosár">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
              <path d="M6 6 5 3H2" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-leather-700 px-1 text-[0.65rem] font-bold text-cream">
                {count}
              </span>
            )}
          </Link>
          <button
            className="btn-ghost lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menü"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-leather-200 bg-cream lg:hidden">
          <div className="container-kb flex flex-col py-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-leather-800"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
