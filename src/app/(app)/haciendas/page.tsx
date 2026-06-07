import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState, Card, Badge } from "@/components/ui";
import { LeafIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HaciendasPage() {
  const [haciendas, animalsByRanch, lotsByRanch, plotsByRanch] =
    await Promise.all([
      prisma.hacienda.findMany({ orderBy: { name: "asc" } }),
      prisma.animal.groupBy({ by: ["ranch"], _count: { _all: true } }),
      prisma.lot.groupBy({ by: ["ranch"], _count: { _all: true } }),
      prisma.plot.groupBy({ by: ["ranch"], _count: { _all: true } }),
    ]);

  const countFor = (
    rows: { ranch: string | null; _count: { _all: number } }[],
    name: string,
  ) => rows.find((r) => r.ranch === name)?._count._all ?? 0;

  return (
    <div>
      <PageHeader
        title="Haciendas"
        subtitle={`${fmtNumber(haciendas.length)} haciendas registradas`}
        action={{ href: "/haciendas/new", label: "Nueva hacienda" }}
      />

      {haciendas.length === 0 ? (
        <EmptyState
          icon={<LeafIcon width={26} height={26} />}
          title="Sin haciendas"
          description="Registra tu primera hacienda para poder seleccionarla en animales, lotes y potreros."
          action={{ href: "/haciendas/new", label: "Nueva hacienda" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {haciendas.map((h) => (
            <Link key={h.id} href={`/haciendas/${h.id}`}>
              <Card className="p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-lg font-bold text-slate-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <LeafIcon width={18} height={18} />
                      </span>
                      {h.name}
                    </p>
                    {h.location && (
                      <p className="mt-1 text-sm text-slate-500">
                        {h.location}
                      </p>
                    )}
                  </div>
                  <ChevronRightIcon className="mt-1 text-slate-400" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge color="green">
                    {fmtNumber(countFor(animalsByRanch, h.name))} animales
                  </Badge>
                  <Badge color="blue">
                    {fmtNumber(countFor(lotsByRanch, h.name))} lotes
                  </Badge>
                  <Badge color="amber">
                    {fmtNumber(countFor(plotsByRanch, h.name))} potreros
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
