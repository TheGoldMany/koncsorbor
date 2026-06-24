export const metadata = { title: "Kapcsolat" };

export default function ContactPage() {
  return (
    <div className="container-kb max-w-3xl py-14">
      <h1 className="text-4xl font-bold text-leather-900">Kapcsolat</h1>
      <p className="mt-4 text-leather-700">
        Kérdésed van egy termékkel, mérettel vagy egyedi rendeléssel kapcsolatban? Keress
        minket bátran az alábbi elérhetőségeken.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-leather-900">Telefon</h2>
          <a href="tel:+36709420725" className="mt-2 block text-2xl font-bold text-leather-700">
            06 70 942 0725
          </a>
          <p className="mt-2 text-sm text-leather-600">Hétköznap 9:00–18:00</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-leather-900">E-mail</h2>
          <a href="mailto:rendeles@koncsorbor.hu" className="mt-2 block text-lg font-semibold text-leather-700">
            rendeles@koncsorbor.hu
          </a>
          <p className="mt-2 text-sm text-leather-600">Általában 24 órán belül válaszolunk.</p>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="text-lg font-semibold text-leather-900">Hogyan tudsz rendelni?</h2>
        <p className="mt-2 text-leather-700">
          Válaszd ki a kívánt terméket a webáruházban, tedd a kosárba, majd a pénztárnál add meg
          a szállítási adataidat. A fizetés biztonságosan, az OTP SimplePay rendszerén keresztül
          történik. Egyedi méretű vagy mintás darabokért keress minket telefonon!
        </p>
      </div>
    </div>
  );
}
