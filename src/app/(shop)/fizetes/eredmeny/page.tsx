import { redirect } from "next/navigation";
import { verifySignature, decodeBackParam } from "@/lib/simplepay";
import { markOrderPaid, markOrderFailed } from "@/lib/orders";

export const dynamic = "force-dynamic";

// SimplePay redirects the customer back here after payment with `r` (base64 JSON)
// and `s` (signature) query parameters.
export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string; s?: string }>;
}) {
  const { r, s } = await searchParams;

  if (!r) redirect("/");

  const valid = s ? verifySignature(r, s) : false;
  const decoded = decodeBackParam(r);
  const orderRef = decoded?.o;
  const event = (decoded?.e || "").toUpperCase();

  if (valid && orderRef) {
    if (event === "SUCCESS") {
      await markOrderPaid(orderRef);
      redirect(`/rendeles/${orderRef}`);
    } else {
      await markOrderFailed(orderRef);
      redirect(`/rendeles/${orderRef}?payment=failed`);
    }
  }

  // Signature couldn't be verified — still show the order if we know it
  if (orderRef) {
    redirect(`/rendeles/${orderRef}?payment=${event === "SUCCESS" ? "unknown" : "failed"}`);
  }

  redirect("/");
}
