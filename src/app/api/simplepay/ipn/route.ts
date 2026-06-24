import { NextRequest, NextResponse } from "next/server";
import { verifySignature, signBody } from "@/lib/simplepay";
import { markOrderPaid, markOrderFailed } from "@/lib/orders";

// SimplePay IPN (Instant Payment Notification) handler.
// Verifies the signature, updates the order, and responds with a signed
// confirmation containing a receiveDate, as required by the SimplePay v2 spec.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("signature") || req.headers.get("Signature") || "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let data: { orderRef?: string; status?: string; transactionId?: string | number };
  try {
    data = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const status = (data.status || "").toUpperCase();
  if (data.orderRef) {
    if (status === "FINISHED" || status === "AUTHORIZED") {
      await markOrderPaid(data.orderRef);
    } else if (status === "FAIL" || status === "CANCELLED" || status === "TIMEOUT") {
      await markOrderFailed(data.orderRef);
    }
  }

  // Build signed confirmation response
  const confirmation = { ...data, receiveDate: new Date().toISOString() };
  const responseBody = JSON.stringify(confirmation);
  const responseSignature = signBody(responseBody);

  return new NextResponse(responseBody, {
    status: 200,
    headers: { "Content-Type": "application/json", Signature: responseSignature },
  });
}
