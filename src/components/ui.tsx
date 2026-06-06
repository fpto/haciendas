import Link from "next/link";
import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { PlusIcon, ChevronRightIcon } from "@/components/icons";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
        >
          <PlusIcon width={18} height={18} />
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  href,
  accent = "brand",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  href?: string;
  accent?: "brand" | "blue" | "amber" | "violet";
}) {
  const accents: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  const inner = (
    <Card className="h-full p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
            {unit && (
              <span className="ml-1 text-base font-medium text-slate-400">
                {unit}
              </span>
            )}
          </p>
        </div>
        {icon && (
          <span
            className={classNames(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              accents[accent],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-brand-600">
          Ver detalles <ChevronRightIcon width={16} height={16} />
        </div>
      )}
    </Card>
  );
  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  return inner;
}

export function Badge({
  children,
  color = "slate",
}: {
  children: ReactNode;
  color?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-brand-100 text-brand-800",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        colors[color],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <PlusIcon width={18} height={18} />
          {action.label}
        </Link>
      )}
    </Card>
  );
}

// Tabla responsiva: scroll horizontal en móvil, ancha en desktop.
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="scroll-x">
        <table className="w-full min-w-[640px] text-left text-sm">
          {children}
        </table>
      </div>
    </Card>
  );
}

export function Th({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={classNames(
        "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={classNames(
        "whitespace-nowrap border-b border-slate-100 px-4 py-3 text-slate-700",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function DescList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="divide-y divide-slate-100">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 px-5 py-3.5"
        >
          <dt className="text-sm font-medium text-slate-500">{it.label}</dt>
          <dd className="text-right text-sm font-semibold text-slate-900">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
