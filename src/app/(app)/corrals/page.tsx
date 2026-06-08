import Link from "next/link";
import { prisma } from "@/lib/db";
import { EmptyState, TableWrap, Th, Td, Card, Badge } from "@/components/ui";
import { CorralIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import { fmtNumber, lotHeadcount } from "@/lib/utils";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getCurrentUser, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CorralsPage() {
  const activeHacienda = await getActiveHacienda();
  const [corrals, user] = await Promise.all([
    prisma.corral.findMany({
      where: activeHacienda ? { ranch: activeHacienda } : undefined,
      orderBy: [{ ranch: "asc" }, { number: "asc" }],
      include: {
        lots: {
          select: {
            _count: { select: { animals: true } },
            weighings: {
              orderBy: [{ date: "desc" }, { id: "desc" }],
              take: 1,
              select: { animalCount: true },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);

  // Cabezas por corral: suma del número de cabezas de los lotes ubicados ahí.
  const headcount = (corral: (typeof corrals)[number]) =>
    corral.lots.reduce((sum, lot) => sum + lotHeadcount(lot), 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Corrales
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {fmtNumber(corrals.length)} corrales registrados
            {activeHacienda ? ` · ${activeHacienda}` : ""}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              href="/corrals/import"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <CorralIcon width={18} height={18} />
              Importar KMZ
            </Link>
            <Link
              href="/corrals/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <PlusIcon width={18} height={18} />
              Nuevo corral
            </Link>
          </div>
        )}
      </div>

      {corrals.length === 0 ? (
        <EmptyState
          icon={<CorralIcon width={26} height={26} />}
          title="Sin corrales"
          description="Registra tus corrales con su ubicación para asignarles lotes de ganado."
          action={canEdit ? { href: "/corrals/new", label: "Nuevo corral" } : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {corrals.map((corral) => (
              <Link key={corral.id} href={`/corrals/${corral.id}`}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">
                      Corral {corral.number}
                    </p>
                    <Badge color="green">{fmtNumber(headcount(corral))} cab.</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {corral.ranch ?? "—"}
                    {corral.latitude != null && corral.longitude != null
                      ? ` · ${fmtNumber(corral.latitude, 4)}, ${fmtNumber(corral.longitude, 4)}`
                      : ""}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Corral</Th>
                  <Th>Hacienda</Th>
                  <Th>Ubicación</Th>
                  <Th className="text-right">Cabezas</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {corrals.map((corral) => (
                  <tr key={corral.id} className="hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">
                      {corral.number ?? corral.id}
                    </Td>
                    <Td>{corral.ranch ?? "—"}</Td>
                    <Td>
                      {corral.latitude != null && corral.longitude != null
                        ? `${fmtNumber(corral.latitude, 5)}, ${fmtNumber(corral.longitude, 5)}`
                        : "—"}
                    </Td>
                    <Td className="text-right">
                      <Badge color="green">{fmtNumber(headcount(corral))}</Badge>
                    </Td>
                    <Td>
                      <Link
                        href={`/corrals/${corral.id}`}
                        className="inline-flex text-brand-600"
                      >
                        <ChevronRightIcon />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </>
      )}
    </div>
  );
}
