import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordReset } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email) {
    return NextResponse.json({ error: "Add meg az e-mail címed." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { email: String(email).toLowerCase().trim() } });

  // Only send if the account exists and has a password (real account). Always
  // return ok to avoid leaking which emails are registered.
  if (customer && customer.password && !customer.deletedAt) {
    const token = crypto.randomBytes(32).toString("hex");
    const exp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.customer.update({
      where: { id: customer.id },
      data: { resetToken: token, resetTokenExp: exp },
    });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/fiok/jelszo-visszaallitas?token=${token}`;
    await sendPasswordReset(customer.email, customer.name, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
