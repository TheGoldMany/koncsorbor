import { NextRequest, NextResponse } from "next/server";
import { loginCustomer, createCustomerSession } from "@/lib/customer-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Add meg az e-mail címet és a jelszót." }, { status: 400 });
  }
  const result = await loginCustomer(email, password);
  if (!result.ok || !result.session) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  await createCustomerSession(result.session);
  return NextResponse.json({ ok: true });
}
