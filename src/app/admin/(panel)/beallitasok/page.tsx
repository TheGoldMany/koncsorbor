import { getAllSettings } from "@/lib/settings";
import { isSimplePayConfigured } from "@/lib/simplepay";
import { isEmailConfigured } from "@/lib/email";
import { PageHeader, SectionTitle } from "@/components/admin/ui";
import { saveSettings } from "@/lib/admin-actions";

function Status({ ok, okLabel = "Beállítva" }: { ok: boolean; okLabel?: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {okLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Nincs beállítva
    </span>
  );
}

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
          <SectionTitle icon="invoices">Cég- és számlázási adatok</SectionTitle>
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
            <SectionTitle icon="revenue">SimplePay fizetés</SectionTitle>
            <p className="flex items-center gap-2 text-sm text-leather-600">
              Állapot:{" "}
              {isSimplePayConfigured() ? <Status ok okLabel={`Beállítva ${sandbox ? "(SANDBOX)" : "(ÉLES)"}`} /> : <Status ok={false} />}
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
            <SectionTitle icon="customers">E-mail értesítések</SectionTitle>
            <p className="flex items-center gap-2 text-sm text-leather-600">
              Állapot: {isEmailConfigured() ? <Status ok /> : <Status ok={false} />}
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
