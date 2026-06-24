import { prisma } from "./db";
import { getSettings } from "./settings";
import { formatHuf } from "./money";
import { formatDate } from "./utils";

// Generates the next sequential invoice number, e.g. KB-2026/0001
async function nextInvoiceNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const counterKey = `invoice_counter_${year}`;
  const result = await prisma.$transaction(async (tx) => {
    const row = await tx.setting.findUnique({ where: { key: counterKey } });
    const next = (row ? parseInt(row.value, 10) : 0) + 1;
    await tx.setting.upsert({
      where: { key: counterKey },
      update: { value: String(next) },
      create: { key: counterKey, value: String(next) },
    });
    return next;
  });
  return `${prefix}-${year}/${String(result).padStart(4, "0")}`;
}

export async function generateInvoiceForOrder(orderId: string) {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, customer: true },
  });
  if (!order) throw new Error("Order not found");

  const s = await getSettings([
    "company_name",
    "company_address",
    "company_tax_id",
    "company_reg",
    "company_email",
    "company_phone",
    "vat_rate",
    "invoice_prefix",
  ]);

  const vatRate = parseInt(s.vat_rate || "27", 10);
  const total = order.total;
  const netAmount = Math.round(total / (1 + vatRate / 100));
  const vatAmount = total - netAmount;

  const number = await nextInvoiceNumber(s.invoice_prefix || "KB");
  const issuedAt = new Date();
  const dueAt = issuedAt;

  const buyerName = order.billingName ?? order.customer.name;
  const buyerAddr = `${order.billingZip ?? ""} ${order.billingCity ?? ""}, ${order.billingAddress ?? ""}`.trim();

  const html = renderInvoiceHtml({
    number,
    issuedAt,
    dueAt,
    seller: s,
    buyerName,
    buyerAddr,
    buyerTax: order.billingTaxId ?? undefined,
    orderNumber: order.orderNumber,
    items: order.items.map((it) => ({
      name: `${it.productName} – ${it.variantName}`,
      qty: it.quantity,
      unit: it.unitPrice,
      total: it.lineTotal,
    })),
    shippingName: order.shippingMethod,
    shippingFee: order.shippingFee,
    netAmount,
    vatAmount,
    vatRate,
    total,
  });

  return prisma.invoice.create({
    data: {
      number,
      orderId: order.id,
      issuedAt,
      dueAt,
      netAmount,
      vatAmount,
      vatRate,
      total,
      buyerName,
      buyerAddr,
      buyerTax: order.billingTaxId ?? undefined,
      html,
    },
  });
}

type InvoiceData = {
  number: string;
  issuedAt: Date;
  dueAt: Date;
  seller: Record<string, string>;
  buyerName: string;
  buyerAddr: string;
  buyerTax?: string;
  orderNumber: string;
  items: { name: string; qty: number; unit: number; total: number }[];
  shippingName: string;
  shippingFee: number;
  netAmount: number;
  vatAmount: number;
  vatRate: number;
  total: number;
};

export function renderInvoiceHtml(d: InvoiceData): string {
  const rows = d.items
    .map(
      (it) => `<tr>
        <td>${escapeHtml(it.name)}</td>
        <td class="num">${it.qty} db</td>
        <td class="num">${formatHuf(it.unit)}</td>
        <td class="num">${formatHuf(it.total)}</td>
      </tr>`
    )
    .join("");

  const shippingRow =
    d.shippingFee > 0
      ? `<tr><td>${escapeHtml(d.shippingName)} (szállítás)</td><td class="num">1</td><td class="num">${formatHuf(
          d.shippingFee
        )}</td><td class="num">${formatHuf(d.shippingFee)}</td></tr>`
      : "";

  return `<!doctype html>
<html lang="hu"><head><meta charset="utf-8"/>
<title>Számla ${escapeHtml(d.number)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #241b15; margin: 0; padding: 32px; background:#fff; }
  .wrap { max-width: 800px; margin: 0 auto; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #6f462c; padding-bottom:16px; }
  .brand { font-size: 22px; font-weight: bold; color:#5c3b29; }
  h1 { font-size: 20px; margin: 0; }
  .muted { color:#6f462c; font-size: 13px; }
  .cols { display:flex; justify-content:space-between; gap:24px; margin: 24px 0; }
  .box { flex:1; }
  .box h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color:#8c5a33; margin:0 0 6px; }
  table { width:100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  th, td { padding: 8px 10px; border-bottom:1px solid #e4cfb3; text-align:left; }
  th { background:#f2e8da; font-size: 12px; text-transform: uppercase; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-left:auto; width: 280px; margin-top: 16px; font-size: 14px; }
  .totals div { display:flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top:2px solid #6f462c; margin-top:6px; padding-top:8px; font-size:17px; font-weight:bold; }
  .foot { margin-top: 32px; font-size: 12px; color:#6f462c; border-top:1px solid #e4cfb3; padding-top:12px; }
</style></head>
<body><div class="wrap">
  <div class="head">
    <div>
      <div class="brand">${escapeHtml(d.seller.company_name)}</div>
      <div class="muted">${escapeHtml(d.seller.company_address)}</div>
      <div class="muted">Adószám: ${escapeHtml(d.seller.company_tax_id)}</div>
      <div class="muted">${escapeHtml(d.seller.company_email)} · ${escapeHtml(d.seller.company_phone)}</div>
    </div>
    <div style="text-align:right">
      <h1>SZÁMLA</h1>
      <div class="muted">Sorszám: <strong>${escapeHtml(d.number)}</strong></div>
      <div class="muted">Rendelés: ${escapeHtml(d.orderNumber)}</div>
    </div>
  </div>

  <div class="cols">
    <div class="box">
      <h3>Vevő</h3>
      <div>${escapeHtml(d.buyerName)}</div>
      <div class="muted">${escapeHtml(d.buyerAddr)}</div>
      ${d.buyerTax ? `<div class="muted">Adószám: ${escapeHtml(d.buyerTax)}</div>` : ""}
    </div>
    <div class="box" style="text-align:right">
      <h3>Dátumok</h3>
      <div class="muted">Kelt: ${formatDate(d.issuedAt)}</div>
      <div class="muted">Teljesítés: ${formatDate(d.issuedAt)}</div>
      <div class="muted">Fizetési határidő: ${formatDate(d.dueAt)}</div>
      <div class="muted">Fizetés módja: Online bankkártya (SimplePay)</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Megnevezés</th><th class="num">Menny.</th><th class="num">Egységár</th><th class="num">Összeg</th></tr></thead>
    <tbody>${rows}${shippingRow}</tbody>
  </table>

  <div class="totals">
    <div><span>Nettó összeg</span><span>${formatHuf(d.netAmount)}</span></div>
    <div><span>ÁFA (${d.vatRate}%)</span><span>${formatHuf(d.vatAmount)}</span></div>
    <div class="grand"><span>Bruttó összesen</span><span>${formatHuf(d.total)}</span></div>
  </div>

  <div class="foot">
    A számla elektronikusan készült és érvényes aláírás nélkül.<br/>
    ${escapeHtml(d.seller.company_name)} · ${escapeHtml(d.seller.company_reg)}
  </div>
</div></body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
