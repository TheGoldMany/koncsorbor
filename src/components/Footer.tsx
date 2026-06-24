import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="leather-texture mt-20 text-cream">
      <div className="container-kb grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-leather-200">
            Kézműves bőrdíszművek a mindennapokra, vadászathoz és túrázáshoz. Valódi,
            növényi cserzésű marhabőrből, gondos kézmunkával.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-leather-200">Vásárlás</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/termekek" className="hover:underline">Összes termék</Link></li>
            <li><Link href="/kategoria/kutya-nyakorvek" className="hover:underline">Kutya nyakörvek</Link></li>
            <li><Link href="/kategoria/ovek" className="hover:underline">Bőrövek</Link></li>
            <li><Link href="/kategoria/tortokok" className="hover:underline">Tőrtokok</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-leather-200">Információk</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/jogi/aszf" className="hover:underline">ÁSZF</Link></li>
            <li><Link href="/jogi/adatvedelem" className="hover:underline">Adatkezelési tájékoztató</Link></li>
            <li><Link href="/jogi/szallitas" className="hover:underline">Szállítás és fizetés</Link></li>
            <li><Link href="/jogi/elallas" className="hover:underline">Elállási jog</Link></li>
            <li><Link href="/jogi/impresszum" className="hover:underline">Impresszum</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-leather-200">Kapcsolat</h4>
          <ul className="space-y-2 text-sm text-leather-100">
            <li>📲 <a href="tel:+36709420725" className="hover:underline">06 70 942 0725</a></li>
            <li>✉️ <a href="mailto:rendeles@koncsorbor.hu" className="hover:underline">rendeles@koncsorbor.hu</a></li>
            <li className="pt-2 text-leather-300">Est. 2026</li>
          </ul>
          <div className="mt-4 flex items-center gap-2 text-xs text-leather-300">
            <span>Biztonságos fizetés:</span>
            <span className="rounded bg-cream/10 px-2 py-1 font-semibold">SimplePay</span>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-kb flex flex-col items-center justify-between gap-2 py-5 text-xs text-leather-300 sm:flex-row">
          <p>© {new Date().getFullYear()} Koncsor Bőrkereskedés. Minden jog fenntartva.</p>
          <p>Online fizetés: OTP SimplePay</p>
        </div>
      </div>
    </footer>
  );
}
