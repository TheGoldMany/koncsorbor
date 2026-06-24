import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { number: decodeURIComponent(number) } });
  if (!invoice) {
    return new NextResponse("A számla nem található.", { status: 404 });
  }
  return new NextResponse(invoice.html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
