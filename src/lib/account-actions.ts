"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./auth";
import { getCurrentCustomer, destroyCustomerSession } from "./customer-auth";

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

export async function updateProfile(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/fiok/bejelentkezes");
  const name = str(formData.get("name"));
  const phone = str(formData.get("phone"));
  if (name.length < 2) return;
  await prisma.customer.update({
    where: { id: customer.id },
    data: { name, phone: phone || null },
  });
  revalidatePath("/fiok");
}

export type ActionResult = { ok?: boolean; error?: string; message?: string };

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const customer = await getCurrentCustomer();
  if (!customer || !customer.password) return { error: "Nincs bejelentkezve." };
  const current = str(formData.get("current"));
  const next = str(formData.get("next"));
  const confirm = str(formData.get("confirm"));
  if (next.length < 6) return { error: "Az új jelszó legalább 6 karakter legyen." };
  if (next !== confirm) return { error: "A két új jelszó nem egyezik." };
  const ok = await verifyPassword(current, customer.password);
  if (!ok) return { error: "A jelenlegi jelszó hibás." };
  await prisma.customer.update({
    where: { id: customer.id },
    data: { password: await hashPassword(next) },
  });
  return { ok: true, message: "A jelszavad sikeresen megváltozott." };
}

// GDPR erasure: if the customer has orders we must keep them for accounting, so
// we anonymize the personal data and disable the login. Otherwise we delete.
export async function deleteAccount(formData: FormData): Promise<void> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/fiok/bejelentkezes");
  const confirm = str(formData.get("confirm"));
  if (confirm !== "TÖRLÉS") {
    return; // safety: require exact confirmation text
  }

  const orderCount = await prisma.order.count({ where: { customerId: customer.id } });
  if (orderCount > 0) {
    const anon = `torolt+${crypto.randomBytes(6).toString("hex")}@koncsorbor.invalid`;
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        email: anon,
        name: "Törölt felhasználó",
        phone: null,
        password: null,
        resetToken: null,
        resetTokenExp: null,
        deletedAt: new Date(),
      },
    });
  } else {
    await prisma.customer.delete({ where: { id: customer.id } });
  }

  await destroyCustomerSession();
  redirect("/?fiok=torolve");
}
