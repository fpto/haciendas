import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getWeightUnit } from "@/lib/units";
import { AppShell } from "@/components/AppShell";
import { Flash } from "@/components/Flash";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, weightUnit] = await Promise.all([
    getCurrentUser(),
    getWeightUnit(),
  ]);
  return (
    <AppShell user={user} weightUnit={weightUnit}>
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      {children}
    </AppShell>
  );
}
