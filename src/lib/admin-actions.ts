"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { requireAdmin, hashPassword } from "./auth";
import { slugify } from "./utils";
import { setSetting } from "./settings";
import { markOrderPaid } from "./orders";
import { sendStatusUpdate } from "./email";
import { generateInvoiceForOrder } from "./invoice";

async function guard() {
  await requireAdmin();
}

function num(v: FormDataEntryValue | null, def = 0): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isNaN(n) ? def : n;
}
function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

/* ---------------- Categories ---------------- */

export async function saveCategory(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug")) || slugify(name);
  const data = {
    name,
    slug,
    description: str(formData.get("description")) || null,
    image: str(formData.get("image")) || null,
    position: num(formData.get("position")),
  };
  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }
  revalidatePath("/admin/kategoriak");
  revalidatePath("/");
  redirect("/admin/kategoriak");
}

export async function deleteCategory(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return; // don't delete a category with products
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/kategoriak");
}

/* ---------------- Products ---------------- */

export async function saveProduct(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug")) || slugify(name);
  const images = str(formData.get("images"))
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = {
    name,
    slug,
    description: str(formData.get("description")),
    details: str(formData.get("details")) || null,
    basePrice: num(formData.get("basePrice")),
    categoryId: str(formData.get("categoryId")),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
  };

  let productId = id;
  if (id) {
    await prisma.product.update({ where: { id }, data });
    await prisma.productImage.deleteMany({ where: { productId: id } });
  } else {
    const created = await prisma.product.create({ data });
    productId = created.id;
  }
  if (images.length) {
    await prisma.productImage.createMany({
      data: images.map((url, i) => ({ url, productId: productId!, position: i, alt: name })),
    });
  }
  revalidatePath("/admin/termekek");
  revalidatePath("/");
  redirect(`/admin/termekek/${productId}`);
}

export async function deleteProduct(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/termekek");
  redirect("/admin/termekek");
}

export async function toggleProductActive(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const p = await prisma.product.findUnique({ where: { id } });
  if (p) await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin/termekek");
}

/* ---------------- Variants ---------------- */

export async function saveVariant(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const productId = str(formData.get("productId"));
  const sku = str(formData.get("sku")) || `KB-${Date.now().toString(36).toUpperCase()}`;
  const data = {
    name: str(formData.get("name")),
    sku,
    priceDiff: num(formData.get("priceDiff")),
    stock: num(formData.get("stock")),
    productId,
  };
  if (id) {
    await prisma.productVariant.update({ where: { id }, data });
  } else {
    await prisma.productVariant.create({ data });
  }
  revalidatePath(`/admin/termekek/${productId}`);
}

export async function deleteVariant(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const productId = str(formData.get("productId"));
  await prisma.productVariant.delete({ where: { id } });
  revalidatePath(`/admin/termekek/${productId}`);
}

export async function updateStock(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const stock = num(formData.get("stock"));
  await prisma.productVariant.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/keszlet");
}

/* ---------------- Orders ---------------- */

const STATUS_LABELS: Record<string, string> = {
  pending: "Feldolgozás alatt",
  paid: "Fizetve",
  processing: "Készítés alatt",
  shipped: "Kiszállítva",
  completed: "Teljesítve",
  cancelled: "Törölve",
};

export async function updateOrderStatus(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  const notify = formData.get("notify") === "on";
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { customer: true },
  });
  if (notify && order.customer.email) {
    await sendStatusUpdate(order.customer.email, order.orderNumber, order.customer.name, STATUS_LABELS[status] ?? status);
  }
  revalidatePath(`/admin/rendelesek/${id}`);
  revalidatePath("/admin/rendelesek");
}

export async function markPaidAction(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  await markOrderPaid(id);
  revalidatePath(`/admin/rendelesek/${id}`);
  revalidatePath("/admin/rendelesek");
}

export async function generateInvoiceAction(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  await generateInvoiceForOrder(id);
  revalidatePath(`/admin/rendelesek/${id}`);
  revalidatePath("/admin/szamlak");
}

/* ---------------- Users ---------------- */

export async function createUser(formData: FormData) {
  await guard();
  const email = str(formData.get("email")).toLowerCase();
  const name = str(formData.get("name"));
  const password = str(formData.get("password"));
  const role = str(formData.get("role")) || "admin";
  if (!email || !password) return;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;
  await prisma.user.create({ data: { email, name, password: await hashPassword(password), role } });
  revalidatePath("/admin/felhasznalok");
}

export async function deleteUser(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const count = await prisma.user.count();
  if (count <= 1) return; // never delete the last user
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/felhasznalok");
}

export async function resetUserPassword(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const password = str(formData.get("password"));
  if (password.length < 6) return;
  await prisma.user.update({ where: { id }, data: { password: await hashPassword(password) } });
  revalidatePath("/admin/felhasznalok");
}

/* ---------------- Shipping methods ---------------- */

export async function saveShipping(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  const data = {
    name: str(formData.get("name")),
    fee: num(formData.get("fee")),
    note: str(formData.get("note")) || null,
    active: formData.get("active") === "on",
    position: num(formData.get("position")),
  };
  if (id) {
    await prisma.shippingMethod.update({ where: { id }, data });
  } else {
    await prisma.shippingMethod.create({ data });
  }
  revalidatePath("/admin/szallitas");
}

export async function deleteShipping(formData: FormData) {
  await guard();
  const id = str(formData.get("id"));
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/admin/szallitas");
}

/* ---------------- Settings ---------------- */

export async function saveSettings(formData: FormData) {
  await guard();
  const keys = [
    "company_name",
    "company_address",
    "company_tax_id",
    "company_reg",
    "company_email",
    "company_phone",
    "vat_rate",
    "invoice_prefix",
  ];
  for (const key of keys) {
    await setSetting(key, str(formData.get(key)));
  }
  revalidatePath("/admin/beallitasok");
  revalidatePath("/");
}
