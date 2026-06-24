import { getAllSettings } from "@/lib/settings";
import { isSimplePayConfigured } from "@/lib/simplepay";
import { isEmailConfigured } from "@/lib/email";
import { PageHeader } from "@/components/admin/ui";
import { saveSettings } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getAllSettings();
  const sandbox = process.env.SIMPLEPAY_SANDBOX !== "false";

  const Field = ({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) => (
    <div>
      <label className="label">{label}</label>
      <input name={name} defaultValue={defaultValue} className="input" />
    </div>
  );

  return (
    <>
      <PageHeader title="Beállítások" subtitle="Cégadatok, számlázás és integrációk." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company / invoice settings */}
        <form action={saveSettings} className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-leather-900">Cég- és számlázási adatok</h2>
          <Field name="company_name" label="Cégnév" defaultValue={s.company_name} />
          <Field name="company_address" label="Cím" defaultValue={s.company_address} />
          <div className="grid grid-cols-2 gap-4">
            <Field name="company_tax_id" label="Adószám" defaultValue={s.company_tax_id} />
            <Field name="company_reg" label="Nyilvántartási / cégjegyzékszám" defaultValue={s.company_reg} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field name="company_email" label="E-mail" defaultValue={s.company_email} />
            <Field name="company_phone" label="Telefon" defaultValue={s.company_phone} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field name="vat_rate" label="ÁFA kulcs (%)" defaultValue={s.vat_rate} />
            <Field name="invoice_prefix" label="Számla előtag" defaultValue={s.invoice_prefix} />
          </div>
          <button className="btn-primary">Beállítások mentése</button>
        </form>

        {/* Integrations status */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-leather-900">SimplePay fizetés</h2>
            <p className="mt-2 flex items-center gap-2 text-sm">
              Állapot:
              {isSimplePayConfigured() ? (
                <span className="badge bg-green-100 text-green-800">Beállítva {sandbox ? "(SANDBOX)" : "(ÉLES)"}</span>
              ) : (
                <span className="badge bg-amber-100 text-amber-800">Nincs beállítva</span>
              )}
            </p>
            <p className="mt-3 text-sm text-leather-600">
              A SimplePay kulcsokat környezeti változókban kell megadni a biztonság érdekében:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-leather-700">
              <li><code>SIMPLEPAY_MERCHANT</code></li>
              <li><code>SIMPLEPAY_SECRET_KEY</code></li>
              <li><code>SIMPLEPAY_SANDBOX</code> (true/false)</li>
            </ul>
            <p className="mt-3 text-xs text-leather-500">
              IPN URL a SimplePay admin felületén: <code>{process.env.NEXT_PUBLIC_SITE_URL || "https://…"}/api/simplepay/ipn</code>
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-leather-900">E-mail értesítések</h2>
            <p className="mt-2 flex items-center gap-2 text-sm">
              Állapot:
              {isEmailConfigured() ? (
                <span className="badge bg-green-100 text-green-800">Beállítva</span>
              ) : (
                <span className="badge bg-amber-100 text-amber-800">Nincs beállítva</span>
              )}
            </p>
            <p className="mt-3 text-sm text-leather-600">SMTP beállítások környezeti változókban:</p>
            <ul className="mt-2 space-y-1 text-sm text-leather-700">
              <li><code>SMTP_HOST</code>, <code>SMTP_PORT</code></li>
              <li><code>SMTP_USER</code>, <code>SMTP_PASS</code></li>
              <li><code>SMTP_FROM</code>, <code>SHOP_NOTIFY_EMAIL</code></li>
            </ul>
            <p className="mt-3 text-xs text-leather-500">
              Beállítás nélkül a rendszer naplózza az e-maileket, de nem küldi ki őket.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
