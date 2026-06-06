import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteLot } from "@/actions/lots";
import { Card, DescList, TableWrap, Th, Td, Badge, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, ChevronRightIcon, CowIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LotShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lotId = Number(id);
  if (Number.isNaN(lotId)) notFound();

  const [lot, user] = await Promise.all([
    prisma.lot.findUnique({
      where: { id: lotId },
      include: { animals: { orderBy: { animalNumber: "asc" } } },
    }),
    getCurrentUser(),
  ]);
  if (!lot) notFound();

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);

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

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
        {lot.name || `Lote ${lot.number}`}
      </h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <DescList
            items={[
              { label: "Número", value: lot.number ?? "—" },
              { label: "Hacienda", value: lot.ranch ?? "—" },
              { label: "Especie", value: <span className="capitalize">{lot.species ?? "—"}</span> },
              { label: "Animales", value: <Badge color="green">{lot.animals.length}</Badge> },
              { label: "Descripción", value: lot.description ?? "—" },
            ]}
          />
        </Card>

        <div className="lg:col-span-2">
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
      </div>
    </div>
  );
}
