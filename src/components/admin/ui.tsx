import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-leather-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-leather-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-leather-200 text-leather-900",
  cancelled: "bg-red-100 text-red-800",
  unpaid: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-200 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Feldolgozás alatt",
  paid: "Fizetve",
  processing: "Készítés alatt",
  shipped: "Kiszállítva",
  completed: "Teljesítve",
  cancelled: "Törölve",
  unpaid: "Fizetésre vár",
  failed: "Sikertelen",
  refunded: "Visszatérítve",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("badge", STATUS_STYLES[status] ?? "bg-leather-100 text-leather-800")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="card p-5 transition-shadow hover:shadow-soft">
      <p className="text-sm text-leather-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-leather-900">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("border-b border-leather-200 bg-leather-50 px-4 py-3 text-left font-semibold text-leather-800", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-leather-100 px-4 py-3 text-leather-800", className)}>{children}</td>;
}
