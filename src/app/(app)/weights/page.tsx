import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState, TableWrap, Th, Td } from "@/components/ui";
import { ScaleIcon, ChevronRightIcon } from "@/components/icons";
import { fmtDate } from "@/lib/utils";
import { getWeightUnit, fmtWeight } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getActiveWeightMode } from "@/lib/activeWeightMode";

export const dynamic = "force-dynamic";

export default async function WeightsPage() {
  const [activeHacienda, mode, unit] = await Promise.all([
    getActiveHacienda(),
    getActiveWeightMode(),
    getWeightUnit(),
  ]);
  const suffix = activeHacienda ? ` · ${activeHacienda}` : "";

  // Hacienda en modo "por lote": los pesos se registran a nivel de lote
  // (LotWeighing), no por animal individual.
  if (mode === "lot") {
    const weighings = await prisma.lotWeighing.findMany({
      where: activeHacienda ? { lot: { ranch: activeHacienda } } : undefined,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: 200,
      include: { lot: { select: { id: true, number: true, name: true } } },
    });

    return (
      <div>
        <PageHeader
          title="Pesos"
          subtitle={`Pesados de lote más recientes${suffix}`}
          action={{ href: "/lot_weighings/new", label: "Registrar pesado" }}
        />

        {weighings.length === 0 ? (
          <EmptyState
            icon={<ScaleIcon width={26} height={26} />}
            title="Sin pesados"
            description="Registra el peso promedio de tus lotes para dar seguimiento a la GDP."
            action={{ href: "/lot_weighings/new", label: "Registrar pesado" }}
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Lote</Th>
                <Th className="text-right">Peso promedio</Th>
                <Th className="text-right">Animales</Th>
                <Th>Nota</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {weighings.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <Td>{fmtDate(w.date)}</Td>
                  <Td className="font-semibold text-slate-900">
                    {w.lot
                      ? w.lot.name || `Lote ${w.lot.number ?? w.lot.id}`
                      : "—"}
                  </Td>
                  <Td className="text-right font-semibold">
                    {fmtWeight(w.averageWeight, unit)}
                  </Td>
                  <Td className="text-right">{w.animalCount ?? "—"}</Td>
                  <Td className="max-w-xs truncate text-slate-500">
                    {w.note ?? "—"}
                  </Td>
                  <Td>
                    {w.lotId && (
                      <Link
                        href={`/lots/${w.lotId}`}
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

  // Modo "por animal" o vista global: pesos individuales.
  const weights = await prisma.weight.findMany({
    where: activeHacienda ? { animal: { ranch: activeHacienda } } : undefined,
    orderBy: { date: "desc" },
    take: 200,
    include: { animal: true },
  });

  return (
    <div>
      <PageHeader
        title="Pesos"
        subtitle={`Últimos registros de peso${suffix}`}
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
