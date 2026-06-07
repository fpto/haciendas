import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteHacienda } from "@/actions/haciendas";
import { Card, DescList, StatCard } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, CowIcon, LotsIcon, PlotIcon, SettingsIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";
import { weightModeLabel, normalizeWeightMode } from "@/lib/weightMode";
import { parseGeoJsonRing } from "@/lib/kml";
import { HaciendaPlotsMap } from "@/components/HaciendaPlotsMap";

export const dynamic = "force-dynamic";

export default async function HaciendaShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const haciendaId = Number(id);
  if (Number.isNaN(haciendaId)) notFound();

  const [hacienda, user] = await Promise.all([
    prisma.hacienda.findUnique({ where: { id: haciendaId } }),
    getCurrentUser(),
  ]);
  if (!hacienda) notFound();

  const [animals, lots, plotRecords] = await Promise.all([
    prisma.animal.count({ where: { ranch: hacienda.name } }),
    prisma.lot.count({ where: { ranch: hacienda.name } }),
    prisma.plot.findMany({
      where: { ranch: hacienda.name },
      select: { id: true, number: true, boundaries: true },
      orderBy: { number: "asc" },
    }),
  ]);
  const plots = plotRecords.length;

  // Potreros con linderos válidos para dibujar en el mapa satelital.
  const mapPlots = plotRecords
    .map((p) => ({
      id: p.id,
      number: p.number,
      ring: parseGeoJsonRing(p.boundaries),
    }))
    .filter((p): p is { id: number; number: string | null; ring: [number, number][] } => p.ring !== null);

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);

  // En las haciendas configuradas "Por Lote" no se gestionan animales
  // individuales, así que se oculta la tarjeta de "Animales".
  const showAnimals = normalizeWeightMode(hacienda.weightMode) !== "lot";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/haciendas"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Haciendas
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/haciendas/${hacienda.id}/configuracion`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <SettingsIcon width={16} height={16} /> Configuración
            </Link>
          )}
          {canEdit && (
            <Link
              href={`/haciendas/${hacienda.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && (
            <DeleteButton
              action={deleteHacienda}
              id={hacienda.id}
              confirmText="¿Eliminar esta hacienda? No se borrarán los animales/lotes/potreros asociados, pero quedarán sin hacienda registrada."
            />
          )}
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        {hacienda.name}
      </h1>

      <div
        className={`mb-6 grid gap-3 sm:gap-4 ${
          showAnimals ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {showAnimals && (
          <StatCard
            label="Animales"
            value={fmtNumber(animals)}
            icon={<CowIcon width={22} height={22} />}
            href="/animals"
            accent="brand"
          />
        )}
        <StatCard
          label="Lotes"
          value={fmtNumber(lots)}
          icon={<LotsIcon width={22} height={22} />}
          href="/lots"
          accent="blue"
        />
        <StatCard
          label="Potreros"
          value={fmtNumber(plots)}
          icon={<PlotIcon width={22} height={22} />}
          href="/plots"
          accent="amber"
        />
      </div>

      <Card className="mb-6 max-w-xl">
        <DescList
          items={[
            { label: "Nombre", value: hacienda.name },
            { label: "Ubicación", value: hacienda.location ?? "—" },
            { label: "Medición de peso", value: weightModeLabel(hacienda.weightMode) },
            { label: "Notas", value: hacienda.notes ?? "—" },
          ]}
        />
      </Card>

      {mapPlots.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Mapa de potreros
          </h2>
          <HaciendaPlotsMap plots={mapPlots} />
        </div>
      )}
    </div>
  );
}
