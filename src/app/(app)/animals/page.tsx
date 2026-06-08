import Link from "next/link";
import { getLatestWeights } from "@/lib/queries";
import { PageHeader, Card, EmptyState, Badge, TableWrap, Th, Td } from "@/components/ui";
import { CowIcon, SearchIcon, ChevronRightIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";
import { getWeightUnit, convertFromKg, fmtWeight } from "@/lib/units";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { getCurrentUser, isEditor } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

const SORTS = [
  { value: "lot_id", label: "Lote" },
  { value: "animal_number", label: "Número" },
  { value: "ranch", label: "Hacienda" },
  { value: "last_weight", label: "Último peso" },
  { value: "daily_gain", label: "GDP" },
  { value: "days_since_last_weight", label: "Días sin pesar" },
];

export default async function AnimalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    direction?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const [unit, activeHacienda, user] = await Promise.all([
    getWeightUnit(),
    getActiveHacienda(),
    getCurrentUser(),
  ]);
  const canEdit = isEditor(user?.role);
  const { rows, total } = await getLatestWeights({
    search: sp.search,
    ranch: activeHacienda ?? undefined,
    sort: sp.sort,
    direction: sp.direction,
    page,
    perPage: PER_PAGE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      search: sp.search,
      sort: sp.sort,
      direction: sp.direction,
      page: String(page),
      ...over,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "" && v !== null) params.set(k, String(v));
    }
    return `/animals?${params.toString()}`;
  };

  return (
    <div>
      <PageHeader
        title="Animales"
        subtitle={`${fmtNumber(total)} en engorde · pesos más recientes${
          activeHacienda ? ` · ${activeHacienda}` : ""
        }`}
        action={canEdit ? { href: "/animals/new", label: "Nuevo animal" } : undefined}
      />

      {/* Filtros */}
      <form className="mb-5 flex flex-col gap-3 sm:flex-row" action="/animals">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width={18}
            height={18}
          />
          <input
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Buscar por número o hacienda…"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <select
          name="sort"
          defaultValue={sp.sort ?? "lot_id"}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Ordenar: {s.label}
            </option>
          ))}
        </select>
        <select
          name="direction"
          defaultValue={sp.direction ?? "asc"}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Aplicar
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={<CowIcon width={26} height={26} />}
          title="Sin resultados"
          description="No hay animales en engorde que coincidan. Registra uno nuevo o ajusta la búsqueda."
          action={canEdit ? { href: "/animals/new", label: "Nuevo animal" } : undefined}
        />
      ) : (
        <>
          {/* Tarjetas (móvil) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {rows.map((r) => (
              <Link key={r.id} href={`/animals/${r.animal_id}`}>
                <Card className="p-4 transition active:scale-[0.99]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        #{r.animal_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.ranch}
                        {r.lot_number ? ` · Lote ${r.lot_number}` : ""}
                      </p>
                    </div>
                    <Badge color="green">{fmtWeight(r.last_weight, unit)}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Metric
                      label="GDP"
                      value={`${fmtNumber(convertFromKg(r.daily_gain, unit), 2)}`}
                    />
                    <Metric
                      label="Cambio"
                      value={fmtWeight(r.weight_change, unit)}
                    />
                    <Metric
                      label="Días"
                      value={fmtNumber(r.days_since_last_weight)}
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Tabla (escritorio) */}
          <div className="hidden lg:block">
            <TableWrap>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Hacienda</Th>
                  <Th>Lote</Th>
                  <Th className="text-right">Último peso</Th>
                  <Th className="text-right">Anterior</Th>
                  <Th className="text-right">Cambio</Th>
                  <Th className="text-right">GDP</Th>
                  <Th className="text-right">Días sin pesar</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">
                      {r.animal_number}
                    </Td>
                    <Td>{r.ranch}</Td>
                    <Td>{r.lot_number ?? "—"}</Td>
                    <Td className="text-right font-semibold">
                      {fmtWeight(r.last_weight, unit)}
                    </Td>
                    <Td className="text-right text-slate-500">
                      {fmtWeight(r.former_weight, unit)}
                    </Td>
                    <Td className="text-right">
                      {fmtWeight(r.weight_change, unit)}
                    </Td>
                    <Td className="text-right">
                      {fmtNumber(convertFromKg(r.daily_gain, unit), 2)}
                    </Td>
                    <Td className="text-right">
                      {fmtNumber(r.days_since_last_weight)}
                    </Td>
                    <Td>
                      <Link
                        href={`/animals/${r.animal_id}`}
                        className="inline-flex text-brand-600 hover:text-brand-700"
                      >
                        <ChevronRightIcon />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <PageLink href={qs({ page: page - 1 })} disabled={page <= 1}>
                ← Anterior
              </PageLink>
              <span className="text-sm text-slate-500">
                Página {page} de {totalPages}
              </span>
              <PageLink
                href={qs({ page: page + 1 })}
                disabled={page >= totalPages}
              >
                Siguiente →
              </PageLink>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-1.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
