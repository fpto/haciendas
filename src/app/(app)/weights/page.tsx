import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState, TableWrap, Th, Td } from "@/components/ui";
import { ScaleIcon, ChevronRightIcon } from "@/components/icons";
import { fmtDate } from "@/lib/utils";
import { getWeightUnit, fmtWeight } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";

export const dynamic = "force-dynamic";

export default async function WeightsPage() {
  const activeHacienda = await getActiveHacienda();
  const [weights, unit] = await Promise.all([
    prisma.weight.findMany({
      where: activeHacienda ? { animal: { ranch: activeHacienda } } : undefined,
      orderBy: { date: "desc" },
      take: 200,
      include: { animal: true },
    }),
    getWeightUnit(),
  ]);

  return (
    <div>
      <PageHeader
        title="Pesos"
        subtitle={`Últimos registros de peso${
          activeHacienda ? ` · ${activeHacienda}` : ""
        }`}
        action={{ href: "/weights/new", label: "Registrar peso" }}
      />

      {weights.length === 0 ? (
        <EmptyState
          icon={<ScaleIcon width={26} height={26} />}
          title="Sin pesos"
          description="Registra el peso de tus animales para dar seguimiento a la GDP."
          action={{ href: "/weights/new", label: "Registrar peso" }}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Animal</Th>
              <Th className="text-right">Peso</Th>
              <Th>Nota</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {weights.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <Td>{fmtDate(w.date)}</Td>
                <Td className="font-semibold text-slate-900">
                  {w.animal
                    ? `#${w.animal.animalNumber ?? w.animal.id}`
                    : "—"}
                </Td>
                <Td className="text-right font-semibold">
                  {fmtWeight(w.weight, unit)}
                </Td>
                <Td className="max-w-xs truncate text-slate-500">
                  {w.note ?? "—"}
                </Td>
                <Td>
                  {w.animalId && (
                    <Link
                      href={`/animals/${w.animalId}`}
                      className="inline-flex text-brand-600"
                    >
                      <ChevronRightIcon />
                    </Link>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
