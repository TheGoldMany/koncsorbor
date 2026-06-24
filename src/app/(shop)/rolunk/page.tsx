import Link from "next/link";

export const metadata = { title: "Rólunk" };

export default function AboutPage() {
  return (
    <div className="container-kb max-w-3xl py-14">
      <h1 className="text-4xl font-bold text-leather-900">A műhelyről</h1>
      <div className="prose-kb mt-6 text-leather-800">
        <p>
          A <strong>Koncsor Bőrkereskedés</strong> kézműves bőrdíszműves műhely, ahol minden darab
          gondos kézmunka eredménye. Hiszünk abban, hogy egy igazán jó bőrtermék nem egy-két
          szezonra szól, hanem egy életen át kiszolgál – és az évek múlásával csak még patinásabb lesz.
        </p>
        <h2>Az alapanyag</h2>
        <p>
          Termékeink valódi, <strong>növényi cserzésű marhabőrből</strong> készülnek, jellemzően
          3–4 mm vastagságban. Ez a létező legtartósabb, legszebb öregedésű prémium bőr. Nem nyúlik,
          nem szakad, és masszív, hegesztett fém kellékekkel szereljük fel, hogy a legnagyobb
          igénybevételnek is ellenálljon.
        </p>
        <h2>Amit készítünk</h2>
        <ul>
          <li><strong>Kutya nyakörvek</strong> – a hűséges társadnak, a vadászatokhoz és erdei túrákhoz</li>
          <li><strong>Bőrövek</strong> – egyedi mintás vadászövek és klasszikus, letisztult darabok</li>
          <li><strong>Tőrtokok</strong> – pontos méretben, derékszíjra bújtatóval</li>
        </ul>
        <h2>Egyedi rendelés</h2>
        <p>
          Minden terméket egyedi méretre szabunk. Ha különleges kérésed van, keress minket bátran
          telefonon vagy a kapcsolat oldalon!
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/termekek" className="btn-primary">Termékek megtekintése</Link>
        <a href="tel:+36709420725" className="btn-outline">📲 06 70 942 0725</a>
      </div>
    </div>
  );
}
