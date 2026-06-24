import Link from "next/link";

const links = [
  { href: "/jogi/aszf", label: "ÁSZF" },
  { href: "/jogi/adatvedelem", label: "Adatkezelési tájékoztató" },
  { href: "/jogi/szallitas", label: "Szállítás és fizetés" },
  { href: "/jogi/elallas", label: "Elállási jog" },
  { href: "/jogi/impresszum", label: "Impresszum" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-kb grid gap-10 py-12 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <nav className="card sticky top-24 p-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-leather-500">Jogi információk</p>
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded px-2 py-1.5 text-sm text-leather-800 hover:bg-leather-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <article className="prose-kb max-w-none text-leather-800 lg:col-span-3">{children}</article>
    </div>
  );
}
