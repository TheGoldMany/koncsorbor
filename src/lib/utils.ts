export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o",
    ú: "u", ü: "u", ű: "u",
  };
  return input
    .toLowerCase()
    .replace(/[áéíóöőúüű]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function genOrderNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `KB-${y}-${rand}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}
