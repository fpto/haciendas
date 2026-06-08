import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { getWeightMode } from "@/lib/settings";
import { AppShell } from "@/components/AppShell";
import { Flash } from "@/components/Flash";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, weightUnit, weightMode] = await Promise.all([
    getCurrentUser(),
    getWeightUnit(),
    getWeightMode(),
  ]);
  return (
    <AppShell user={user} weightUnit={weightUnit} weightMode={weightMode}>
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      {children}
    </AppShell>
  );
}
