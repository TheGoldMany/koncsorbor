import nodemailer from "nodemailer";
import { formatHuf } from "./money";

function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST);
}

type SendArgs = { to: string; subject: string; html: string; attachments?: { filename: string; content: string; contentType?: string }[] };

export async function sendEmail({ to, subject, html, attachments }: SendArgs): Promise<boolean> {
  const transport = getTransport();
  const from = process.env.SMTP_FROM || "Koncsor Bőrkereskedés <noreply@koncsorbor.hu>";
  if (!transport) {
    console.log(`[email skipped — SMTP not configured] to=${to} subject="${subject}"`);
    return false;
  }
  try {
    await transport.sendMail({ from, to, subject, html, attachments });
    return true;
  } catch (e) {
    console.error("[email error]", (e as Error).message);
    return false;
  }
}

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  items: { productName: string; variantName: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  shippingFee: number;
  shippingMethod: string;
  total: number;
  shippingName: string;
  shippingZip: string;
  shippingCity: string;
  shippingAddress: string;
};

function orderRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.productName} – ${i.variantName} × ${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatHuf(
          i.lineTotal
        )}</td></tr>`
    )
    .join("");
}

function shell(title: string, inner: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#241b15">
    <div style="background:#4e3325;color:#f7f1e6;padding:24px;text-align:center">
      <div style="font-size:20px;font-weight:bold;letter-spacing:1px">KONCSOR BŐRKERESKEDÉS</div>
      <div style="font-size:11px;letter-spacing:3px;color:#d3b088">KÉZMŰVES BŐRDÍSZMŰ</div>
    </div>
    <div style="padding:24px;background:#f7f1e6">
      <h2 style="color:#5c3b29">${title}</h2>
      ${inner}
    </div>
    <div style="padding:16px;text-align:center;font-size:12px;color:#8c5a33;background:#f2e8da">
      Koncsor Bőrkereskedés · 06 70 942 0725 · rendeles@koncsorbor.hu
    </div>
  </div>`;
}

export async function sendOrderConfirmation(to: string, d: OrderEmailData, invoiceHtml?: string): Promise<boolean> {
  const inner = `
    <p>Kedves ${d.customerName}!</p>
    <p>Köszönjük a rendelésed! A fizetés sikeresen megtörtént. Az alábbiakban összefoglaltuk a rendelésed részleteit.</p>
    <p><strong>Rendelésszám:</strong> ${d.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${orderRows(d.items)}
      <tr><td style="padding:6px 0">Szállítás (${d.shippingMethod})</td><td style="padding:6px 0;text-align:right">${
        d.shippingFee === 0 ? "Ingyenes" : formatHuf(d.shippingFee)
      }</td></tr>
      <tr><td style="padding:10px 0;font-weight:bold">Összesen</td><td style="padding:10px 0;text-align:right;font-weight:bold;font-size:16px">${formatHuf(
        d.total
      )}</td></tr>
    </table>
    <p><strong>Szállítási cím:</strong><br/>
    ${d.shippingName}<br/>${d.shippingZip} ${d.shippingCity}<br/>${d.shippingAddress}</p>
    <p>A csomagod elkészítését megkezdjük. Bármilyen kérdés esetén keress minket bátran!</p>
  `;
  const attachments = invoiceHtml
    ? [{ filename: `szamla-${d.orderNumber}.html`, content: invoiceHtml, contentType: "text/html" }]
    : undefined;
  return sendEmail({ to, subject: `Rendelés visszaigazolás – ${d.orderNumber}`, html: shell("Rendelés visszaigazolás", inner), attachments });
}

export async function sendAdminNotification(d: OrderEmailData): Promise<boolean> {
  const to = process.env.SHOP_NOTIFY_EMAIL || process.env.SMTP_FROM || "";
  if (!to) return false;
  const inner = `
    <p>Új, kifizetett rendelés érkezett!</p>
    <p><strong>Rendelésszám:</strong> ${d.orderNumber}</p>
    <p><strong>Vevő:</strong> ${d.customerName}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${orderRows(d.items)}
      <tr><td style="padding:10px 0;font-weight:bold">Összesen</td><td style="padding:10px 0;text-align:right;font-weight:bold">${formatHuf(
        d.total
      )}</td></tr>
    </table>
    <p><strong>Szállítás:</strong> ${d.shippingName}, ${d.shippingZip} ${d.shippingCity}, ${d.shippingAddress}</p>
  `;
  return sendEmail({ to, subject: `Új rendelés – ${d.orderNumber}`, html: shell("Új rendelés", inner) });
}

export async function sendPasswordReset(to: string, name: string, resetUrl: string): Promise<boolean> {
  const inner = `
    <p>Kedves ${name}!</p>
    <p>Jelszó-visszaállítást kértél a Koncsor Bőrkereskedés fiókodhoz. Kattints az alábbi gombra az új jelszó megadásához:</p>
    <p style="margin:24px 0"><a href="${resetUrl}" style="background:#6f462c;color:#f7f1e6;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Új jelszó beállítása</a></p>
    <p style="font-size:13px;color:#8c5a33">Ha nem te kérted, hagyd figyelmen kívül ezt az e-mailt. A link 1 órán át érvényes.</p>
    <p style="font-size:12px;color:#8c5a33;word-break:break-all">${resetUrl}</p>
  `;
  return sendEmail({ to, subject: "Jelszó visszaállítása – Koncsor Bőrkereskedés", html: shell("Jelszó visszaállítása", inner) });
}

export async function sendWelcome(to: string, name: string): Promise<boolean> {
  const inner = `
    <p>Kedves ${name}!</p>
    <p>Köszönjük, hogy regisztráltál a Koncsor Bőrkereskedés webáruházába! Mostantól nyomon követheted a rendeléseidet és gyorsabban tudsz vásárolni.</p>
    <p>Jó böngészést kívánunk kézműves bőrtermékeink között!</p>
  `;
  return sendEmail({ to, subject: "Üdvözlünk a Koncsor Bőrkereskedésnél!", html: shell("Sikeres regisztráció", inner) });
}

export async function sendStatusUpdate(to: string, orderNumber: string, customerName: string, statusLabel: string): Promise<boolean> {
  const inner = `
    <p>Kedves ${customerName}!</p>
    <p>A(z) <strong>${orderNumber}</strong> számú rendelésed állapota megváltozott:</p>
    <p style="font-size:18px;font-weight:bold;color:#5c3b29">${statusLabel}</p>
    <p>Köszönjük, hogy a Koncsor Bőrkereskedést választottad!</p>
  `;
  return sendEmail({ to, subject: `Rendelés állapota – ${orderNumber}`, html: shell("Rendelés állapot frissítés", inner) });
}
