import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isAdmin, isEditor } from "@/lib/auth";
import { deleteAnimal } from "@/actions/animals";
import { Card, DescList, Badge, TableWrap, Th, Td, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { ArrowLeftIcon, EditIcon, PlusIcon, ScaleIcon } from "@/components/icons";
import { fmtNumber, fmtDate, fmtMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnimalShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animalId = Number(id);
  if (Number.isNaN(animalId)) notFound();

  const [animal, user] = await Promise.all([
    prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        lot: true,
        sale: true,
        weights: { orderBy: { date: "desc" } },
      },
    }),
    getCurrentUser(),
  ]);
  if (!animal) notFound();

  const weights = animal.weights;
  const dates = weights.map((w) => w.date).filter(Boolean) as Date[];
  const first = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : null;
  const last = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null;
  const dateDif =
    first && last
      ? Math.round((last.getTime() - first.getTime()) / 86400000)
      : 0;
  const sinceLast =
    last && dateDif !== 0
      ? Math.round((Date.now() - last.getTime()) / 86400000)
      : null;

  const canEdit = isEditor(user?.role);
  const canDelete = isAdmin(user?.role);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/animals"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftIcon width={16} height={16} /> Animales
        </Link>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link
              href={`/animals/${animal.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <EditIcon width={16} height={16} /> Editar
            </Link>
          )}
          {canDelete && <DeleteButton action={deleteAnimal} id={animal.id} />}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Animal #{animal.animalNumber ?? animal.id}
        </h1>
        <Badge color={animal.status === "engorde" ? "green" : "slate"}>
          {animal.status ?? "—"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <DescList
              items={[
                { label: "Especie", value: <span className="capitalize">{animal.species ?? "—"}</span> },
                { label: "Hacienda", value: animal.ranch ?? "—" },
                {
                  label: "Lote",
                  value: animal.lot ? (
                    <Link href={`/lots/${animal.lot.id}`} className="text-brand-600">
                      {animal.lot.number ?? `#${animal.lot.id}`}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
                { label: "Raza", value: animal.breed ?? "—" },
                { label: "Color", value: animal.color ?? "—" },
                { label: "Marca / Arete", value: animal.mark ?? "—" },
                { label: "Proveedor", value: animal.provider ?? "—" },
                { label: "Nacimiento", value: fmtDate(animal.birthday) },
                { label: "Precio compra", value: animal.purchasePrice ? `${fmtMoney(animal.purchasePrice)}/kg` : "—" },
                { label: "Precio venta", value: animal.salePrice ? `${fmtMoney(animal.salePrice)}/kg` : "—" },
                {
                  label: "Venta",
                  value: animal.sale ? (
                    <Link href={`/sales/${animal.sale.id}`} className="text-brand-600">
                      {animal.sale.buyer ?? `#${animal.sale.id}`}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 grid grid-cols-3 gap-3">
            <StatBox label="Pesos" value={fmtNumber(weights.length)} />
            <StatBox label="Días en hacienda" value={dateDif ? fmtNumber(dateDif) : "—"} />
            <StatBox
              label="Días sin pesar"
              value={sinceLast === null ? "—" : fmtNumber(sinceLast)}
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Historial de pesos
            </h2>
            {canEdit && (
              <Link
                href={`/weights/new?animal_id=${animal.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                <PlusIcon width={16} height={16} /> Registrar peso
              </Link>
            )}
          </div>

          {weights.length === 0 ? (
            <EmptyState
              icon={<ScaleIcon width={24} height={24} />}
              title="Sin pesos registrados"
              description="Registra el primer peso para empezar a calcular GDP y rendimiento."
              action={canEdit ? { href: `/weights/new?animal_id=${animal.id}`, label: "Registrar peso" } : undefined}
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th className="text-right">Peso</Th>
                  <Th>Nota</Th>
                  {canEdit && <Th></Th>}
                </tr>
              </thead>
              <tbody>
                {weights.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <Td>{fmtDate(w.date)}</Td>
                    <Td className="text-right font-semibold">
                      {fmtNumber(w.weight, 1)} kg
                    </Td>
                    <Td className="max-w-xs truncate text-slate-500">
                      {w.note ?? "—"}
                    </Td>
                    {canEdit && (
                      <Td>
                        <Link
                          href={`/weights/${w.id}/edit`}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          <EditIcon width={16} height={16} />
                        </Link>
                      </Td>
                    )}
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

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </Card>
  );
}
