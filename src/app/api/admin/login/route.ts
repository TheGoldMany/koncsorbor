import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Add meg az e-mail címet és a jelszót." }, { status: 400 });
  }
  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "Hibás e-mail cím vagy jelszó." }, { status: 401 });
  }
  await createSession(user);
  return NextResponse.json({ ok: true });
}
