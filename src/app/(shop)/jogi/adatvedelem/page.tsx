export const metadata = { title: "Adatkezelési tájékoztató" };

export default function AdatvedelemPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-leather-900">Adatkezelési tájékoztató</h1>
      <p className="text-sm text-leather-500">Minta dokumentum a GDPR (EU 2016/679) szerint — kérjük, jogi ellenőrzés után használd.</p>

      <h2>1. Az adatkezelő</h2>
      <p>
        Az adatkezelő a Koncsor Bőrkereskedés. Elérhetőségei az{" "}
        <a href="/jogi/impresszum">Impresszum</a> oldalon találhatók.
      </p>

      <h2>2. A kezelt adatok köre és célja</h2>
      <ul>
        <li><strong>Rendelés teljesítése:</strong> név, e-mail cím, telefonszám, szállítási és számlázási cím.</li>
        <li><strong>Számlázás:</strong> számlázási név, cím, adószám (cég esetén) — jogi kötelezettség teljesítése.</li>
        <li><strong>Fizetés:</strong> a fizetéshez szükséges adatok az OTP Mobil Kft. (SimplePay) felé kerülnek továbbításra.</li>
        <li><strong>Kapcsolatfelvétel:</strong> a megadott elérhetőségi adatok.</li>
      </ul>

      <h2>3. Az adatkezelés jogalapja</h2>
      <ul>
        <li>Szerződés teljesítése (GDPR 6. cikk (1) b)).</li>
        <li>Jogi kötelezettség teljesítése, pl. számviteli megőrzés (GDPR 6. cikk (1) c)).</li>
        <li>Hozzájárulás, pl. hírlevél esetén (GDPR 6. cikk (1) a)).</li>
      </ul>

      <h2>4. Adatfeldolgozók</h2>
      <ul>
        <li><strong>Fizetési szolgáltató:</strong> OTP Mobil Kft. (SimplePay), 1143 Budapest, Hungária krt. 17-19.</li>
        <li><strong>Tárhelyszolgáltató:</strong> a webáruházat kiszolgáló tárhely üzemeltetője.</li>
        <li><strong>Futárszolgálat:</strong> a kiválasztott szállítási partner.</li>
      </ul>

      <h2>5. Az adatok megőrzési ideje</h2>
      <p>
        A számviteli bizonylatokat a jogszabály szerint 8 évig őrizzük meg. Az egyéb adatokat az
        adatkezelési cél megszűnéséig, illetve a hozzájárulás visszavonásáig kezeljük.
      </p>

      <h2>6. Az érintett jogai</h2>
      <p>
        Az érintett kérheti adatai helyesbítését, törlését, korlátozását, tiltakozhat az adatkezelés
        ellen, és élhet az adathordozhatósághoz való jogával. Jogai megsértése esetén a Nemzeti
        Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhat:{" "}
        <a href="https://naih.hu" target="_blank" rel="noreferrer">https://naih.hu</a>.
      </p>

      <h2>7. Sütik (cookie-k)</h2>
      <p>
        A webáruház a működéshez szükséges sütiket használ (pl. a kosár tartalmának tárolásához a
        böngésződben). Ezek nélkülözhetetlenek a szolgáltatás működéséhez.
      </p>
    </>
  );
}
