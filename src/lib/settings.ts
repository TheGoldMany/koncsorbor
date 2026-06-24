import { prisma } from "./db";

export const DEFAULT_SETTINGS: Record<string, string> = {
  company_name: "Koncsor Bőrkereskedés",
  company_address: "—",
  company_tax_id: "—",
  company_reg: "—",
  company_email: "rendeles@koncsorbor.hu",
  company_phone: "06 70 942 0725",
  vat_rate: "27",
  invoice_prefix: "KB",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const k of keys) {
    map[k] = rows.find((r) => r.key === k)?.value ?? DEFAULT_SETTINGS[k] ?? "";
  }
  return map;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map = { ...DEFAULT_SETTINGS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
