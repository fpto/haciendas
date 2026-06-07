import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteLot } from "@/actions/lots";
import { Card, DescList, TableWrap, Th, Td, Badge, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import {
  ArrowLeftIcon,
  EditIcon,
  ChevronRightIcon,
  CowIcon,
  PlusIcon,
  ScaleIcon,
  MoneyIcon,
} from "@/components/icons";
import { getActiveWeightMode } from "@/lib/activeWeightMode";
import { fmtNumber, fmtDate, fmtMoney } from "@/lib/utils";
import {
  getWeightUnit,
  fmtWeight,
  convertFromKg,
  gainLabel,
  type WeightUnit,
} from "@/lib/units";
import { lotStatusLabel, lotStatusBadgeColor } from "@/lib/lotStatus";

export const dynamic = "force-dynamic";

// Ganancia diaria de peso (GDP) en kg/día entre dos pesados consecutivos.
// `current` es el pesado más reciente y `previous` el anterior.
function dailyGainKg(
  current: { averageWeight: number | null; date: Date | null },
  previous: { averageWeight: number | null; date: Date | null },
): number | null {
  if (
    current.averageWeight == null ||
    previous.averageWeight == null ||
    !current.date ||
    !previous.date
  )
    return null;
  const days =
    (new Date(current.date).getTime() - new Date(previous.date).getTime()) /
    86_400_000;
  if (days <= 0) return null;
  return (current.averageWeight - previous.averageWeight) / days;
}

// Formatea una GDP (en kg/día) a la unidad preferida, con signo explícito.
function fmtGain(kgPerDay: number | null, unit: WeightUnit): string {
  const v = convertFromKg(kgPerDay, unit);
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${fmtNumber(v, 2)} ${gainLabel(unit)}`;
}

export default async function LotShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lotId = Number(id);
  if (Number.isNaN(lotId)) notFound();

  const [lot, user, unit, weightMode] = await Promise.all([
    prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        plot: true,
        animals: { orderBy: { animalNumber: "asc" } },
        weighings: { orderBy: [{ date: "desc" }, { id: "desc" }] },
      },
    }),
    getCurrentUser(),
    getWeightUnit(),
    getActiveWeightMode(),
  ]);
  if (!lot) notFound();

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);
  // En modo "Por Lote", un lote en crecimiento se puede vender desde su ficha.
  const canSell = canEdit && weightMode === "lot" && lot.status === "growing";

  // El peso promedio y el número de animales del lote provienen del último pesado.
  const latest = lot.weighings[0] ?? null;

  // GDP del lote: ganancia diaria entre el primer y el último pesado registrado.
  // Solo tiene sentido cuando hay más de un pesado.
  const oldest =
    lot.weighings.length > 1 ? lot.weighings[lot.weighings.length - 1] : null;
  const overallGain =
    latest && oldest ? dailyGainKg(latest, oldest) : null;

  // Total de la venta del lote: precio por kg × peso total del último pesado
  // (peso promedio × número de cabezas). Solo aplica a lotes vendidos.
  const saleWeightKg =
    latest?.averageWeight != null && latest?.animalCount != null
      ? latest.averageWeight * latest.animalCount
      : null;
  const saleTotal =
    lot.salePrice != null && saleWeightKg != null
      ? lot.salePrice * saleWeightKg
      : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/lots"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Lotes
        </Link>
        <div className="flex items-center gap-2">
          {canSell && (
            <Link
              href={`/sales/new?lot_id=${lot.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <MoneyIcon width={16} height={16} /> Vender lote
            </Link>
          )}
          {canEdit && (
            <Link
              href={`/lots/${lot.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && <DeleteButton action={deleteLot} id={lot.id} />}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {lot.name || `Lote ${lot.number}`}
        </h1>
        <Badge color={lotStatusBadgeColor(lot.status)}>
          {lotStatusLabel(lot.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <DescList
            items={[
              { label: "Número", value: lot.number ?? "—" },
              {
                label: "Estado",
                value: (
                  <Badge color={lotStatusBadgeColor(lot.status)}>
                    {lotStatusLabel(lot.status)}
                  </Badge>
                ),
              },
              { label: "Hacienda", value: lot.ranch ?? "—" },
              {
                label: "Potrero",
                value: lot.plot ? (
                  <Link href={`/plots/${lot.plot.id}`} className="text-brand-600">
                    {lot.plot.number
                      ? `Potrero ${lot.plot.number}`
                      : `#${lot.plot.id}`}
                  </Link>
                ) : (
                  "—"
                ),
              },
              { label: "Especie", value: <span className="capitalize">{lot.species ?? "—"}</span> },
              {
                label: "Peso promedio",
                value: fmtWeight(latest?.averageWeight ?? null, unit),
              },
              {
                label: "Número de cabezas",
                value:
                  latest?.animalCount != null ? (
                    <Badge color="green">{latest.animalCount}</Badge>
                  ) : (
                    "—"
                  ),
              },
              { label: "Último pesado", value: fmtDate(latest?.date) },
              ...(overallGain !== null
                ? [
                    {
                      label: "GDP (ganancia diaria)",
                      value: (
                        <span
                          className={
                            overallGain >= 0
                              ? "font-semibold text-emerald-600"
                              : "font-semibold text-red-600"
                          }
                        >
                          {fmtGain(overallGain, unit)}
                        </span>
                      ),
                    },
                  ]
                : []),
              // En modo "Por Lote" no se gestionan animales individuales, así
              // que se omite el conteo de animales registrados del lote.
              ...(weightMode !== "lot"
                ? [
                    {
                      label: "Animales registrados",
                      value: <Badge color="slate">{lot.animals.length}</Badge>,
                    },
                  ]
                : []),
              { label: "Descripción", value: lot.description ?? "—" },
            ]}
          />
        </Card>

        <div className="lg:col-span-2 space-y-8">
          {lot.status === "sold" && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Venta del lote
              </h2>
              <Card>
                <DescList
                  items={[
                    { label: "Comprador", value: lot.buyer ?? "—" },
                    { label: "Fecha de venta", value: fmtDate(lot.saleDate) },
                    {
                      label: "Precio de venta",
                      value:
                        lot.salePrice != null
                          ? `${fmtMoney(lot.salePrice)}/lb`
                          : "—",
                    },
                    {
                      label: "Peso total vendido",
                      value: fmtWeight(saleWeightKg, unit, 0),
                    },
                    { label: "Total de la venta", value: fmtMoney(saleTotal) },
                    { label: "Comentario", value: lot.saleComment ?? "—" },
                  ]}
                />
              </Card>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Registros de pesado
              </h2>
              {canEdit && (
                <Link
                  href={`/lot_weighings/new?lot_id=${lot.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  <PlusIcon width={16} height={16} /> Nuevo pesado
                </Link>
              )}
            </div>

            {lot.weighings.length === 0 ? (
              <EmptyState
                icon={<ScaleIcon width={24} height={24} />}
                title="Sin pesados"
                description="Registra el primer pesado del lote con su peso promedio y número de cabezas."
                action={
                  canEdit
                    ? { href: `/lot_weighings/new?lot_id=${lot.id}`, label: "Nuevo pesado" }
                    : undefined
                }
              />
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th className="text-right">Peso promedio</Th>
                    {lot.weighings.length > 1 && (
                      <Th className="text-right">GDP</Th>
                    )}
                    <Th className="text-right">Cabezas</Th>
                    <Th>Notas</Th>
                    {canEdit && <Th></Th>}
                  </tr>
                </thead>
                <tbody>
                  {lot.weighings.map((w, i) => {
                    // Pesado anterior (más antiguo): la lista está ordenada por
                    // fecha descendente, así que es el siguiente índice.
                    const previous = lot.weighings[i + 1];
                    const gain = previous ? dailyGainKg(w, previous) : null;
                    return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <Td>{fmtDate(w.date)}</Td>
                      <Td className="text-right font-semibold">
                        {fmtWeight(w.averageWeight, unit)}
                      </Td>
                      {lot.weighings.length > 1 && (
                        <Td
                          className={
                            gain === null
                              ? "text-right text-slate-400"
                              : gain >= 0
                                ? "text-right font-medium text-emerald-600"
                                : "text-right font-medium text-red-600"
                          }
                        >
                          {gain === null ? "—" : fmtGain(gain, unit)}
                        </Td>
                      )}
                      <Td className="text-right">{w.animalCount ?? "—"}</Td>
                      <Td className="max-w-xs truncate text-slate-500">
                        {w.note ?? "—"}
                      </Td>
                      {canEdit && (
                        <Td>
                          <Link
                            href={`/lot_weighings/${w.id}/edit`}
                            className="text-brand-600 hover:text-brand-700"
                          >
                            <EditIcon width={16} height={16} />
                          </Link>
                        </Td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            )}
          </div>

          {/* La lista de animales individuales del lote solo aplica en modo
              "Por Animal"; en modo "Por Lote" se oculta por completo. */}
          {weightMode !== "lot" && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Animales del lote
              </h2>
              {lot.animals.length === 0 ? (
                <EmptyState
                  icon={<CowIcon width={24} height={24} />}
                  title="Sin animales"
                  description="Asigna animales a este lote desde la ficha de cada animal."
                />
              ) : (
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>#</Th>
                      <Th>Especie</Th>
                      <Th>Estatus</Th>
                      <Th></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lot.animals.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <Td className="font-semibold text-slate-900">
                          {a.animalNumber ?? a.id}
                        </Td>
                        <Td className="capitalize">{a.species ?? "—"}</Td>
                        <Td>
                          <Badge color={a.status === "engorde" ? "green" : "slate"}>
                            {a.status ?? "—"}
                          </Badge>
                        </Td>
                        <Td>
                          <Link
                            href={`/animals/${a.id}`}
                            className="inline-flex text-brand-600"
                          >
                            <ChevronRightIcon />
                          </Link>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
