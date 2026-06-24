import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerCustomer, createCustomerSession } from "@/lib/customer-auth";
import { sendWelcome } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2, "Add meg a neved."),
  email: z.string().email("Érvénytelen e-mail cím."),
  phone: z.string().min(5, "Add meg a telefonszámod."),
  password: z.string().min(6, "A jelszó legalább 6 karakter legyen."),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, phone, password } = parsed.data;
  const result = await registerCustomer(email, name, phone, password);
  if (!result.ok || !result.session) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  await createCustomerSession(result.session);
  await sendWelcome(email, name);
  return NextResponse.json({ ok: true });
}
