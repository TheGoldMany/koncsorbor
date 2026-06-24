import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./auth";

const COOKIE = "kb_customer";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-1234567890"
);

export type CustomerSession = { id: string; email: string; name: string };

export async function createCustomerSession(c: CustomerSession): Promise<void> {
  const token = await new SignJWT({ ...c, typ: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.typ !== "customer") return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

// Returns the full, current customer record (verifies it still exists / not deleted).
export async function getCurrentCustomer() {
  const session = await getCustomerSession();
  if (!session) return null;
  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  if (!customer || customer.deletedAt) return null;
  return customer;
}

export async function registerCustomer(
  email: string,
  name: string,
  phone: string,
  password: string
): Promise<{ ok: boolean; error?: string; session?: CustomerSession }> {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await prisma.customer.findUnique({ where: { email: cleanEmail } });
  if (existing && existing.password && !existing.deletedAt) {
    return { ok: false, error: "Ezzel az e-mail címmel már létezik fiók." };
  }
  const hash = await hashPassword(password);
  // If a guest customer (from a previous order) exists, upgrade it to a full account.
  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { name, phone, password: hash, deletedAt: null },
      })
    : await prisma.customer.create({
        data: { email: cleanEmail, name, phone, password: hash },
      });
  return { ok: true, session: { id: customer.id, email: customer.email, name: customer.name } };
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string; session?: CustomerSession }> {
  const customer = await prisma.customer.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!customer || !customer.password || customer.deletedAt) {
    return { ok: false, error: "Hibás e-mail cím vagy jelszó." };
  }
  const valid = await verifyPassword(password, customer.password);
  if (!valid) return { ok: false, error: "Hibás e-mail cím vagy jelszó." };
  return { ok: true, session: { id: customer.id, email: customer.email, name: customer.name } };
}
