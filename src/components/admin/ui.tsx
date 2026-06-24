import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./Icon";

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
    <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-leather-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-leather-500">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  processing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  completed: "bg-leather-100 text-leather-800 ring-leather-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  unpaid: "bg-amber-50 text-amber-700 ring-amber-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  refunded: "bg-gray-100 text-gray-600 ring-gray-500/20",
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
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status] ?? "bg-leather-100 text-leather-800 ring-leather-600/20"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: IconName;
}) {
  const inner = (
    <div className="group flex items-center gap-4 rounded-2xl border border-leather-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leather-100 text-leather-700">
          <Icon name={icon} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-leather-500">{label}</p>
        <p className="mt-0.5 truncate text-xl font-bold text-leather-950">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-leather-200/70 bg-white p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon, children }: { icon?: IconName; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-leather-900">
      {icon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-leather-100 text-leather-700">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      )}
      {children}
    </h2>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-leather-200/70 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-leather-200 bg-leather-50/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-leather-600",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-leather-100 px-4 py-3 align-middle text-leather-800", className)}>
      {children}
    </td>
  );
}
