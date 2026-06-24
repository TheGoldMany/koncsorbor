import { prisma } from "./db";
import { generateInvoiceForOrder } from "./invoice";
import { sendOrderConfirmation, sendAdminNotification } from "./email";

// Idempotently marks an order as paid: decrements stock, generates the invoice,
// and sends confirmation emails. Safe to call multiple times (IPN + back URL).
export async function markOrderPaid(orderNumberOrId: string): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { OR: [{ orderNumber: orderNumberOrId }, { id: orderNumberOrId }] },
    include: { items: true, customer: true },
  });
  if (!order) return;
  if (order.paymentStatus === "paid") return; // already processed

  // decrement stock for each item (best-effort, never negative)
  for (const item of order.items) {
    if (!item.variantId) continue;
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { decrement: item.quantity } },
    }).catch(() => {});
  }
  // clamp any negatives to 0
  await prisma.productVariant.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "paid", status: "paid" },
  });

  // invoice
  let invoiceHtml: string | undefined;
  try {
    const inv = await generateInvoiceForOrder(order.id);
    invoiceHtml = inv.html;
  } catch (e) {
    console.error("[invoice generation failed]", (e as Error).message);
  }

  // emails
  const emailData = {
    orderNumber: order.orderNumber,
    customerName: order.customer.name,
    items: order.items.map((i) => ({
      productName: i.productName,
      variantName: i.variantName,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    shippingMethod: order.shippingMethod,
    total: order.total,
    shippingName: order.shippingName,
    shippingZip: order.shippingZip,
    shippingCity: order.shippingCity,
    shippingAddress: order.shippingAddress,
  };
  await sendOrderConfirmation(order.customer.email, emailData, invoiceHtml);
  await sendAdminNotification(emailData);
}

export async function markOrderFailed(orderNumber: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.paymentStatus === "paid") return;
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: "failed" },
  });
}
