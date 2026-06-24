import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || !password || String(password).length < 6) {
    return NextResponse.json({ error: "Hiányzó adatok, vagy túl rövid jelszó (min. 6 karakter)." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { resetToken: String(token) } });
  if (!customer || !customer.resetTokenExp || customer.resetTokenExp < new Date()) {
    return NextResponse.json({ error: "A visszaállító link érvénytelen vagy lejárt." }, { status: 400 });
  }

  const hash = await hashPassword(String(password));
  await prisma.customer.update({
    where: { id: customer.id },
    data: { password: hash, resetToken: null, resetTokenExp: null, deletedAt: null },
  });

  await createCustomerSession({ id: customer.id, email: customer.email, name: customer.name });
  return NextResponse.json({ ok: true });
}
