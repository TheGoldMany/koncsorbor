import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { genOrderNumber } from "@/lib/utils";
import { startPayment, isSimplePayConfigured } from "@/lib/simplepay";

const schema = z.object({
  items: z
    .array(z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(99) }))
    .min(1),
  shippingMethodId: z.string(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
  }),
  shipping: z.object({
    zip: z.string().min(3),
    city: z.string().min(2),
    address: z.string().min(3),
  }),
  billing: z
    .object({
      sameAsShipping: z.boolean(),
      name: z.string().optional(),
      taxId: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  note: z.string().max(1000).optional(),
  acceptTerms: z.literal(true),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Hibás kérés." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Hiányzó vagy hibás adatok. Kérjük, ellenőrizd a mezőket." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // shipping method
  const shippingMethod = await prisma.shippingMethod.findUnique({
    where: { id: data.shippingMethodId },
  });
  if (!shippingMethod || !shippingMethod.active) {
    return NextResponse.json({ error: "Érvénytelen szállítási mód." }, { status: 400 });
  }

  // re-validate items from DB
  const variantIds = data.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const lineItems: {
    variantId: string;
    productName: string;
    variantName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const item of data.items) {
    const v = variants.find((x) => x.id === item.variantId);
    if (!v || !v.product.active) {
      return NextResponse.json({ error: "Egy termék már nem elérhető. Frissítsd a kosarad." }, { status: 409 });
    }
    if (v.stock < item.quantity) {
      return NextResponse.json(
        { error: `A(z) "${v.product.name} – ${v.name}" termékből csak ${v.stock} db érhető el.` },
        { status: 409 }
      );
    }
    const unitPrice = v.product.basePrice + v.priceDiff;
    lineItems.push({
      variantId: v.id,
      productName: v.product.name,
      variantName: v.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
  const shippingFee = shippingMethod.fee;
  const total = subtotal + shippingFee;

  // upsert customer
  const customer = await prisma.customer.upsert({
    where: { email: data.customer.email.toLowerCase() },
    update: { name: data.customer.name, phone: data.customer.phone },
    create: {
      email: data.customer.email.toLowerCase(),
      name: data.customer.name,
      phone: data.customer.phone,
    },
  });

  const billing = data.billing;
  const order = await prisma.order.create({
    data: {
      orderNumber: genOrderNumber(),
      customerId: customer.id,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: isSimplePayConfigured() ? "simplepay" : "manual",
      subtotal,
      shippingFee,
      total,
      shippingName: data.customer.name,
      shippingPhone: data.customer.phone,
      shippingZip: data.shipping.zip,
      shippingCity: data.shipping.city,
      shippingAddress: data.shipping.address,
      billingName: billing && !billing.sameAsShipping ? billing.name : data.customer.name,
      billingTaxId: billing && !billing.sameAsShipping ? billing.taxId : undefined,
      billingZip: billing && !billing.sameAsShipping ? billing.zip : data.shipping.zip,
      billingCity: billing && !billing.sameAsShipping ? billing.city : data.shipping.city,
      billingAddress: billing && !billing.sameAsShipping ? billing.address : data.shipping.address,
      shippingMethod: shippingMethod.name,
      note: data.note,
      items: { create: lineItems },
    },
  });

  // Start payment if SimplePay configured
  if (isSimplePayConfigured()) {
    const result = await startPayment({
      orderRef: order.orderNumber,
      total,
      email: customer.email,
      customerName: customer.name,
      invoice: {
        name: order.billingName ?? customer.name,
        country: "hu",
        zip: order.billingZip ?? data.shipping.zip,
        city: order.billingCity ?? data.shipping.city,
        address: order.billingAddress ?? data.shipping.address,
      },
      items: [
        ...lineItems.map((li) => ({
          ref: li.variantId,
          title: `${li.productName} – ${li.variantName}`,
          amount: li.quantity,
          price: li.unitPrice,
        })),
        { ref: "shipping", title: shippingMethod.name, amount: 1, price: shippingFee },
      ],
    });

    if (!result.ok || !result.paymentUrl) {
      return NextResponse.json(
        { error: result.error || "A fizetés indítása sikertelen.", orderNumber: order.orderNumber },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentRef: result.transactionId },
    });

    return NextResponse.json({ redirectUrl: result.paymentUrl, orderNumber: order.orderNumber });
  }

  // No online payment configured — confirm as manual order
  return NextResponse.json({
    redirectUrl: `/rendeles/${order.orderNumber}?manual=1`,
    orderNumber: order.orderNumber,
  });
}
