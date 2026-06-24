import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Impresszum" };

export default async function ImpresszumPage() {
  const s = await getAllSettings();
  return (
    <>
      <h1 className="text-3xl font-bold text-leather-900">Impresszum</h1>
      <p>A jelen weboldal üzemeltetőjének adatai:</p>
      <ul>
        <li><strong>Cégnév / vállalkozó:</strong> {s.company_name}</li>
        <li><strong>Székhely:</strong> {s.company_address}</li>
        <li><strong>Adószám:</strong> {s.company_tax_id}</li>
        <li><strong>Nyilvántartási / cégjegyzékszám:</strong> {s.company_reg}</li>
        <li><strong>E-mail:</strong> {s.company_email}</li>
        <li><strong>Telefon:</strong> {s.company_phone}</li>
      </ul>
      <h2>Tárhelyszolgáltató</h2>
      <p>
        A tárhelyszolgáltató adatait itt tüntesd fel (pl. Vercel Inc., 340 S Lemon Ave #4133,
        Walnut, CA 91789, USA).
      </p>
      <h2>Online vitarendezés</h2>
      <p>
        Az Európai Bizottság online vitarendezési platformja:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">https://ec.europa.eu/consumers/odr</a>
      </p>
      <p className="text-sm text-leather-500">
        Megjegyzés: ez egy minta-impresszum. Kérjük, töltsd ki a valós cégadatokkal a Beállítások menüben.
      </p>
    </>
  );
}
