import crypto from "crypto";

// OTP SimplePay v2 integration.
// Docs: HMAC-SHA384 signature over the exact JSON body, base64 encoded,
// sent/received in the "Signature" header.

const SANDBOX = process.env.SIMPLEPAY_SANDBOX !== "false";
const BASE = SANDBOX
  ? "https://sandbox.simplepay.hu/payment/v2"
  : "https://secure.simplepay.hu/payment/v2";

export function isSimplePayConfigured(): boolean {
  return Boolean(process.env.SIMPLEPAY_MERCHANT && process.env.SIMPLEPAY_SECRET_KEY);
}

export function signBody(body: string): string {
  const key = process.env.SIMPLEPAY_SECRET_KEY || "";
  return crypto.createHmac("sha384", key).update(body, "utf8").digest("base64");
}

export function verifySignature(body: string, signature: string): boolean {
  const expected = signBody(body);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export type StartParams = {
  orderRef: string;
  total: number;
  email: string;
  customerName: string;
  invoice: {
    name: string;
    country: string;
    zip: string;
    city: string;
    address: string;
  };
  items: { ref: string; title: string; amount: number; price: number }[];
};

export type StartResult = {
  ok: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
};

export async function startPayment(p: StartParams): Promise<StartResult> {
  if (!isSimplePayConfigured()) {
    return { ok: false, error: "SimplePay nincs beállítva" };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const payload = {
    salt: crypto.randomBytes(16).toString("hex"),
    merchant: process.env.SIMPLEPAY_MERCHANT,
    orderRef: p.orderRef,
    currency: "HUF",
    customerEmail: p.email,
    language: "HU",
    sdkVersion: "KoncsorBor_1.0",
    methods: ["CARD"],
    total: p.total,
    timeout: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    url: `${siteUrl}/fizetes/eredmeny`,
    invoice: {
      name: p.invoice.name,
      country: p.invoice.country || "hu",
      state: p.invoice.city,
      city: p.invoice.city,
      zip: p.invoice.zip,
      address: p.invoice.address,
    },
    items: p.items.map((it) => ({
      ref: it.ref,
      title: it.title,
      amount: it.amount,
      price: it.price,
    })),
  };

  const body = JSON.stringify(payload);
  const signature = signBody(body);

  try {
    const res = await fetch(`${BASE}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Signature: signature },
      body,
    });
    const text = await res.text();
    const data = JSON.parse(text);
    if (data.errorCodes) {
      return { ok: false, error: `SimplePay hiba: ${JSON.stringify(data.errorCodes)}` };
    }
    return { ok: true, paymentUrl: data.paymentUrl, transactionId: String(data.transactionId) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Decode the "r" back-redirect parameter (base64 JSON).
export function decodeBackParam(r: string): {
  r: number; // response code, 0 = success-ish; SimplePay uses e/event field too
  t?: number;
  e?: string; // event: SUCCESS | FAIL | CANCEL | TIMEOUT
  m?: string;
  o?: string; // orderRef
} | null {
  try {
    return JSON.parse(Buffer.from(r, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
