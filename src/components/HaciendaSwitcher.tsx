"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { classNames } from "@/lib/utils";
import { ACTIVE_HACIENDA_COOKIE } from "@/lib/activeHaciendaCookie";
import {
  BullHeadIcon,
  ChevronDownIcon,
  CheckIcon,
  SettingsIcon,
} from "@/components/icons";

const ALL_LABEL = "Todas las haciendas";

// Selector de la hacienda activa para la barra lateral. Guarda el nombre elegido
// en una cookie legible por el servidor y refresca para que los componentes
// server re-rendericen. Incluye un acceso a "Hacienda Admin" para crear y
// configurar haciendas.
export function HaciendaSwitcher({
  haciendas,
  active,
  onNavigate,
}: {
  haciendas: { id: number; name: string }[];
  active: string | null;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // El valor activo puede ser un nombre heredado que ya no existe en la lista.
  const known = active && haciendas.some((h) => h.name === active);
  const currentLabel = active ?? ALL_LABEL;

  function choose(name: string | null) {
    setOpen(false);
    const value = name ?? "";
    document.cookie = `${ACTIVE_HACIENDA_COOKIE}=${encodeURIComponent(
      value,
    )}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="relative px-3 pb-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <BullHeadIcon width={18} height={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Hacienda
          </span>
          <span className="block truncate text-sm font-semibold text-slate-900">
            {currentLabel}
            {active && !known ? " (sin registrar)" : ""}
          </span>
        </span>
        <ChevronDownIcon
          width={18}
          height={18}
          className={classNames(
            "shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute inset-x-3 z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          <div className="max-h-64 overflow-y-auto">
            <OptionRow
              label={ALL_LABEL}
              selected={!active}
              onClick={() => choose(null)}
            />
            {haciendas.map((h) => (
              <OptionRow
                key={h.id}
                label={h.name}
                selected={active === h.name}
                onClick={() => choose(h.name)}
              />
            ))}
            {active && !known && (
              <OptionRow
                label={`${active} (sin registrar)`}
                selected
                onClick={() => choose(active)}
              />
            )}
          </div>
          <div className="my-1 border-t border-slate-100" />
          <Link
            href="/haciendas"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <SettingsIcon width={18} height={18} />
            Hacienda Admin
          </Link>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={classNames(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
        selected
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-slate-600 hover:bg-slate-50",
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {selected && <CheckIcon width={16} height={16} />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
