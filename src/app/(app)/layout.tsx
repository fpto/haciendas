import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { normalizeWeightMode } from "@/lib/weightMode";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { Flash } from "@/components/Flash";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, weightUnit, activeHacienda, haciendas] = await Promise.all([
    getCurrentUser(),
    getWeightUnit(),
    getActiveHacienda(),
    prisma.hacienda.findMany({
      select: { id: true, name: true, weightMode: true },
      orderBy: { name: "asc" },
    }),
  ]);
  // Modo de peso de la hacienda activa (null = todas las haciendas).
  const active = haciendas.find((h) => h.name === activeHacienda);
  const activeWeightMode = active
    ? normalizeWeightMode(active.weightMode)
    : null;
  return (
    <AppShell
      user={user}
      weightUnit={weightUnit}
      haciendas={haciendas}
      activeHacienda={activeHacienda}
      activeWeightMode={activeWeightMode}
    >
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      {children}
    </AppShell>
  );
}
