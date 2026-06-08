import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteCorral } from "@/actions/corrals";
import { Card, DescList, TableWrap, Th, Td, Badge, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, ChevronRightIcon, LotsIcon } from "@/components/icons";
import { fmtNumber, lotHeadcount } from "@/lib/utils";
import { lotStatusLabel, lotStatusBadgeColor } from "@/lib/lotStatus";
import { CorralMap } from "@/components/CorralMap";

export const dynamic = "force-dynamic";

export default async function CorralShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const corralId = Number(id);
  if (Number.isNaN(corralId)) notFound();

  const [corral, user] = await Promise.all([
    prisma.corral.findUnique({
      where: { id: corralId },
      include: {
        lots: {
          orderBy: [{ number: "asc" }],
          include: {
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
  if (!corral) notFound();

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);
  const hasLocation = corral.latitude != null && corral.longitude != null;

  // Cabezas en el corral: suma del número de cabezas de los lotes ubicados aquí.
  const animalCount = corral.lots.reduce((sum, lot) => sum + lotHeadcount(lot), 0);

  const details = [
    { label: "Número", value: corral.number ?? "—" },
    {
      label: "Cabezas",
      value: <Badge color="green">{fmtNumber(animalCount)}</Badge>,
    },
    {
      label: "Ubicación",
      value: hasLocation
        ? `${fmtNumber(corral.latitude, 6)}, ${fmtNumber(corral.longitude, 6)}`
        : "—",
    },
    { label: "Comentario", value: corral.comment ?? "—" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/corrals"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Corrales
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/corrals/${corral.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && <DeleteButton action={deleteCorral} id={corral.id} />}
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        Corral {corral.number}
      </h1>

      {hasLocation && (
        <div className="mb-5">
          <CorralMap lat={corral.latitude!} lng={corral.longitude!} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <DescList items={details} />
        </Card>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Lotes en este corral
          </h2>

          {corral.lots.length === 0 ? (
            <EmptyState
              icon={<LotsIcon width={24} height={24} />}
              title="Sin lotes"
              description="Asigna lotes a este corral desde la ficha de cada lote."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Lote</Th>
                  <Th>Estado</Th>
                  <Th className="text-right">Cabezas</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {corral.lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">
                      {lot.name || lot.number || `#${lot.id}`}
                    </Td>
                    <Td>
                      <Badge color={lotStatusBadgeColor(lot.status)}>
                        {lotStatusLabel(lot.status)}
                      </Badge>
                    </Td>
                    <Td className="text-right">{fmtNumber(lotHeadcount(lot))}</Td>
                    <Td>
                      <Link
                        href={`/lots/${lot.id}`}
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
      </div>
    </div>
  );
}
