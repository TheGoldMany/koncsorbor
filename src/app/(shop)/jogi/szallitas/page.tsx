import { prisma } from "@/lib/db";
import { formatHuf } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Szállítás és fizetés" };

export default async function SzallitasPage() {
  const methods = await prisma.shippingMethod.findMany({ where: { active: true }, orderBy: { position: "asc" } });
  return (
    <>
      <h1 className="text-3xl font-bold text-leather-900">Szállítás és fizetés</h1>

      <h2>Fizetési módok</h2>
      <p>
        A webáruházban biztonságos online bankkártyás fizetés érhető el az <strong>OTP SimplePay</strong>{" "}
        rendszerén keresztül. A fizetés során a bankkártyaadatok közvetlenül a SimplePay biztonságos
        felületén kerülnek megadásra, azokhoz a Szolgáltató nem fér hozzá.
      </p>

      <h2>Szállítási módok és díjak</h2>
      {methods.length === 0 ? (
        <p>A szállítási módokról kérjük, érdeklődj telefonon: 06 70 942 0725.</p>
      ) : (
        <ul>
          {methods.map((m) => (
            <li key={m.id}>
              <strong>{m.name}</strong> – {m.fee === 0 ? "ingyenes" : formatHuf(m.fee)}
              {m.note ? ` (${m.note})` : ""}
            </li>
          ))}
        </ul>
      )}

      <h2>Szállítási idő</h2>
      <p>
        A raktáron lévő termékeket a fizetés beérkezését követően a lehető leghamarabb feladjuk.
        Mivel termékeink kézzel készülnek, az egyedi méretű vagy egyedi mintás darabok esetében a
        gyártási idő hosszabb lehet — erről minden esetben tájékoztatunk.
      </p>

      <h2>Átvétel</h2>
      <p>
        Kérjük, átvételkor ellenőrizd a csomag sértetlenségét. Sérülés esetén kérj jegyzőkönyvet a
        futártól, és jelezd felénk a fenti elérhetőségeken.
      </p>
    </>
  );
}
