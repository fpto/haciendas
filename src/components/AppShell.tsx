"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { classNames } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { UnitToggle } from "@/components/UnitToggle";
import { HaciendaSwitcher } from "@/components/HaciendaSwitcher";
import {
  DashboardIcon,
  CowIcon,
  LotsIcon,
  PlotIcon,
  MoneyIcon,
  ScaleIcon,
  MenuIcon,
  CloseIcon,
  LogoutIcon,
  LeafIcon,
  SidebarIcon,
} from "@/components/icons";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

const NAV = [
  { href: "/", label: "Tablero", Icon: DashboardIcon, exact: true },
  { href: "/animals", label: "Animales", Icon: CowIcon },
  { href: "/lots", label: "Lotes", Icon: LotsIcon },
  { href: "/plots", label: "Potreros", Icon: PlotIcon },
  { href: "/sales", label: "Ventas", Icon: MoneyIcon },
  { href: "/weights", label: "Pesos", Icon: ScaleIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  user,
  weightUnit,
  haciendas,
  activeHacienda,
  activeWeightMode,
  children,
}: {
  user: SessionUser | null;
  weightUnit: "kg" | "lb";
  haciendas: { id: number; name: string }[];
  activeHacienda: string | null;
  activeWeightMode: "lot" | "animal" | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // En modo "por lote" los pesos se registran a nivel de lote, así que se oculta
  // la sección de Animales. La barra inferior móvil usa los 5 primeros destinos.
  const nav = NAV.filter(
    (item) => !(item.href === "/animals" && activeWeightMode === "lot"),
  );
  const mobileNav = nav.slice(0, 5);

  // Restaura la preferencia de la barra lateral guardada.
  useEffect(() => {
    setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="min-h-dvh">
      {/* ===== Sidebar desktop ===== */}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:flex",
          collapsed && "lg:-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between pr-2">
          <Brand />
          <button
            onClick={toggleCollapsed}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Ocultar barra lateral"
            title="Ocultar barra lateral"
          >
            <SidebarIcon width={20} height={20} />
          </button>
        </div>
        <HaciendaSwitcher haciendas={haciendas} active={activeHacienda} />
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={classNames(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive(pathname, href, exact)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon width={20} height={20} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-medium text-slate-400">
            Unidad de peso
          </span>
          <UnitToggle initial={weightUnit} />
        </div>
        <UserFooter user={user} />
      </aside>

      {/* ===== Botón para mostrar la barra (escritorio, cuando está oculta) ===== */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="fixed left-4 top-4 z-30 hidden items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 lg:flex"
          aria-label="Mostrar barra lateral"
          title="Mostrar barra lateral"
        >
          <SidebarIcon width={20} height={20} />
        </button>
      )}

      {/* ===== Drawer móvil ===== */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="animate-slide-up absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>
            <HaciendaSwitcher
              haciendas={haciendas}
              active={activeHacienda}
              onNavigate={() => setOpen(false)}
            />
            <nav className="flex-1 space-y-1 px-3 py-4">
              {nav.map(({ href, label, Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={classNames(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition",
                    isActive(pathname, href, exact)
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <Icon width={22} height={22} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium text-slate-400">
                Unidad de peso
              </span>
              <UnitToggle initial={weightUnit} />
            </div>
            <UserFooter user={user} />
          </aside>
        </div>
      )}

      {/* ===== Topbar móvil ===== */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <LeafIcon className="text-brand-600" width={22} height={22} />
          <span className="text-lg font-bold text-slate-900">Haciendas</span>
        </Link>
        <div className="ml-auto">
          <UnitToggle initial={weightUnit} />
        </div>
      </header>

      {/* ===== Contenido ===== */}
      <main
        className={classNames(
          "px-4 pb-24 pt-5 transition-[margin,padding] duration-200 sm:px-6 lg:px-10 lg:pb-10 lg:pt-8",
          collapsed ? "lg:ml-0 lg:pt-20" : "lg:ml-64",
        )}
      >
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* ===== Tab bar inferior móvil ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {mobileNav.map(({ href, label, Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={classNames(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
                active ? "text-brand-600" : "text-slate-400",
              )}
            >
              <Icon width={22} height={22} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 px-5 py-4"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
        <LeafIcon width={20} height={20} />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Haciendas
      </span>
    </Link>
  );
}

function UserFooter({ user }: { user: SessionUser | null }) {
  if (!user) {
    return (
      <div className="border-t border-slate-200 p-3">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }
  return (
    <div className="border-t border-slate-200 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {(user.firstName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user.firstName || user.email}
          </p>
          <p className="truncate text-xs capitalize text-slate-400">
            {user.role}
          </p>
        </div>
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
            aria-label="Cerrar sesión"
          >
            <LogoutIcon width={18} height={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
