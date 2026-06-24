export const metadata = { title: "Általános Szerződési Feltételek" };

export default function AszfPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-leather-900">Általános Szerződési Feltételek (ÁSZF)</h1>
      <p className="text-sm text-leather-500">Hatályos: a közzététel napjától. Minta dokumentum — kérjük, jogi ellenőrzés után használd.</p>

      <h2>1. Az üzemeltető adatai</h2>
      <p>
        A webáruházat a Koncsor Bőrkereskedés (a továbbiakban: Szolgáltató) üzemelteti. A pontos
        cégadatok az <a href="/jogi/impresszum">Impresszum</a> oldalon találhatók.
      </p>

      <h2>2. Általános rendelkezések</h2>
      <p>
        A jelen ÁSZF a Szolgáltató és a webáruházban vásárló (a továbbiakban: Vásárló) közötti
        jogviszony feltételeit szabályozza. A megrendelés leadásával a Vásárló elfogadja a jelen
        feltételeket. A szerződés nyelve magyar, a megkötött szerződés nem minősül írásbeli
        szerződésnek, azt a Szolgáltató nem iktatja.
      </p>

      <h2>3. A megrendelhető termékek</h2>
      <p>
        A termékek kézműves bőrdíszművek (kutya nyakörvek, övek, tőrtokok). A termékeknél feltüntetett
        árak forintban értendők és tartalmazzák az ÁFA-t. A szállítási díj a megrendelés során, a
        pénztárnál kerül feltüntetésre.
      </p>

      <h2>4. A rendelés menete</h2>
      <ul>
        <li>A Vásárló a kosárba helyezi a kívánt termékeket és kivitelt (méret/szín).</li>
        <li>A pénztárnál megadja a szállítási és számlázási adatait.</li>
        <li>Kiválasztja a szállítási módot és elfogadja a jelen ÁSZF-et.</li>
        <li>A „Fizetés és rendelés” gombra kattintva a megrendelés véglegesítésre kerül.</li>
        <li>A fizetés az OTP SimplePay rendszerén keresztül, biztonságos környezetben történik.</li>
      </ul>

      <h2>5. Fizetés</h2>
      <p>
        Az online bankkártyás fizetés az OTP Mobil Kft. SimplePay rendszerén keresztül valósul meg.
        A bankkártyaadatok a Szolgáltatóhoz nem jutnak el. A sikeres fizetésről a Vásárló e-mailben
        visszaigazolást és elektronikus számlát kap.
      </p>

      <h2>6. SimplePay adattovábbítási nyilatkozat</h2>
      <p>
        Tudomásul veszem, hogy a Koncsor Bőrkereskedés adatkezelő által a webáruház felhasználói
        adatbázisában tárolt alábbi személyes adataim átadásra kerülnek az OTP Mobil Kft.
        (1143 Budapest, Hungária krt. 17-19.), mint adatfeldolgozó részére. Az adatkezelő által
        továbbított adatok köre az alábbi: név, e-mail cím, telefonszám, számlázási és szállítási
        cím. Az adatfeldolgozó által végzett adatfeldolgozási tevékenység jellege és célja a
        SimplePay Adatkezelési tájékoztatóban, az alábbi linken tekinthető meg:{" "}
        <a href="https://simplepay.hu/adatkezelesi-tajekoztatok/" target="_blank" rel="noreferrer">
          https://simplepay.hu/adatkezelesi-tajekoztatok/
        </a>
      </p>

      <h2>7. Szállítás</h2>
      <p>
        A szállítás feltételeit és díjait a <a href="/jogi/szallitas">Szállítás és fizetés</a> oldal
        tartalmazza. Kézműves termékek esetén a gyártási idő a termék jellegétől függően változhat,
        erről a Szolgáltató tájékoztatja a Vásárlót.
      </p>

      <h2>8. Elállási jog</h2>
      <p>
        A fogyasztót megillető elállási jog részleteit az <a href="/jogi/elallas">Elállási jog</a>{" "}
        oldal tartalmazza. Felhívjuk a figyelmet, hogy a kifejezetten a Vásárló utasításai alapján,
        egyedi méretre készített termékek esetében az elállási jog a vonatkozó jogszabályok szerint
        korlátozott lehet.
      </p>

      <h2>9. Szavatosság, jótállás</h2>
      <p>
        A Szolgáltatót a Polgári Törvénykönyv és a 19/2014. (IV.29.) NGM rendelet szerinti kellék-
        és termékszavatossági kötelezettség terheli.
      </p>

      <h2>10. Panaszkezelés</h2>
      <p>
        Panaszaiddal fordulj hozzánk a fenti elérhetőségeken. Amennyiben a panasz kezelésével nem
        értesz egyet, a lakóhelyed szerint illetékes békéltető testülethez fordulhatsz.
      </p>
    </>
  );
}
