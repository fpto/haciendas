import { prisma } from "@/lib/db";
import { getDashboardStats } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { getWeightUnit, convertFromKg, weightLabel, gainLabel } from "@/lib/units";
import { StatCard, Card } from "@/components/ui";
import { fmtNumber, lotHeadcount } from "@/lib/utils";
import { parseGeoJsonRing } from "@/lib/kml";
import { PlotsOverviewMap, type PlotMarker } from "@/components/PlotsOverviewMap";
import {
  CowIcon,
  ScaleIcon,
  CalendarIcon,
  TrendUpIcon,
  LotsIcon,
  PlotIcon,
  MoneyIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, user, unit, plots] = await Promise.all([
    getDashboardStats(),
    getCurrentUser(),
    getWeightUnit(),
    prisma.plot.findMany({
      select: {
        id: true,
        number: true,
        boundaries: true,
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
  ]);

  // Marcadores del mapa: potreros con geometría + número de animales en cada uno.
  const plotMarkers: PlotMarker[] = plots
    .map((p) => {
      const ring = parseGeoJsonRing(p.boundaries);
      if (!ring) return null;
      const animalCount = p.lots.reduce(
        (sum, lot) => sum + lotHeadcount(lot),
        0,
      );
      return {
        id: p.id,
        label: `Potrero ${p.number ?? p.id}`,
        ring,
        animalCount,
      };
    })
    .filter((m): m is PlotMarker => m !== null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hola{user?.firstName ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Resumen general de tu operación ganadera
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Bovinos en engorde
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Cabezas"
            value={fmtNumber(stats.bovineCount)}
            icon={<CowIcon width={22} height={22} />}
            href="/animals"
            accent="brand"
          />
          <StatCard
            label="Peso promedio"
            value={fmtNumber(convertFromKg(stats.bovineAverageWeight, unit), 1)}
            unit={weightLabel(unit)}
            icon={<ScaleIcon width={22} height={22} />}
            href="/animals"
            accent="blue"
          />
          <StatCard
            label="Días en hacienda"
            value={fmtNumber(stats.bovineDaysInRanch)}
            unit="días"
            icon={<CalendarIcon width={22} height={22} />}
            href="/animals"
            accent="amber"
          />
          <StatCard
            label="GDP promedio"
            value={fmtNumber(convertFromKg(stats.bovineDailyGain, unit), 2)}
            unit={gainLabel(unit)}
            icon={<TrendUpIcon width={22} height={22} />}
            href="/animals"
            accent="violet"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Inventario
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Animales"
            value={fmtNumber(stats.totalAnimals)}
            icon={<CowIcon width={22} height={22} />}
            href="/animals"
          />
          <StatCard
            label="Lotes"
            value={fmtNumber(stats.totalLots)}
            icon={<LotsIcon width={22} height={22} />}
            href="/lots"
          />
          <StatCard
            label="Potreros"
            value={fmtNumber(stats.totalPlots)}
            icon={<PlotIcon width={22} height={22} />}
            href="/plots"
          />
          <StatCard
            label="Ventas"
            value={fmtNumber(stats.totalSales)}
            icon={<MoneyIcon width={22} height={22} />}
            href="/sales"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Mapa de potreros
        </h2>
        {plotMarkers.length === 0 ? (
          <Card className="p-5">
            <p className="text-sm text-slate-500">
              Aún no hay potreros con geometría para mostrar en el mapa. Importa
              tus potreros desde un archivo KMZ en{" "}
              <span className="font-semibold text-slate-700">Potreros</span> para
              verlos aquí con el número de animales en cada uno.
            </p>
          </Card>
        ) : (
          <PlotsOverviewMap plots={plotMarkers} />
        )}
      </section>

      <Card className="mt-8 p-5">
        <p className="text-sm text-slate-500">
          Las métricas de bovinos consideran únicamente los animales con estatus{" "}
          <span className="font-semibold text-slate-700">engorde</span> y se
          calculan a partir de sus dos pesos más recientes. La{" "}
          <span className="font-semibold text-slate-700">GDP</span> es la
          ganancia diaria de peso ({gainLabel(unit)}).
        </p>
      </Card>
    </div>
  );
}
