import "server-only";
import { prisma } from "@/lib/db";
import { toNum } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Consultas SQL crudas portadas desde los modelos de Rails (Animal, Lot, Plot,
// Sale). Postgres devuelve los agregados como numeric/string, por eso usamos
// CAST ... ::float8 y/o toNum() para normalizar a number en JS.
// ---------------------------------------------------------------------------

export type DashboardStats = {
  bovineCount: number;
  bovineAverageWeight: number;
  bovineDailyGain: number;
  bovineDaysInRanch: number;
  totalAnimals: number;
  totalLots: number;
  totalPlots: number;
  totalSales: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  // Peso promedio y conteo por especie (solo animales en engorde).
  const avgWeight = await prisma.$queryRawUnsafe<
    { species: string; count: number; average_weight: number }[]
  >(`
    SELECT animals.species AS species,
           COUNT(DISTINCT animals.id)::float8 AS count,
           AVG(weights.weight)::float8 AS average_weight
    FROM animals
    JOIN weights ON weights.animal_id = animals.id
    JOIN (
      SELECT animal_id,
             MAX(weights.date) AS latest_date,
             MIN(weights.date) AS before_date
      FROM weights
      WHERE (SELECT COUNT(*) FROM weights f
             WHERE f.animal_id = weights.animal_id
               AND f.weight >= weights.weight) <= 2
      GROUP BY animal_id
    ) AS dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
    JOIN weights w2 ON w2.animal_id = dates.animal_id AND w2.date = dates.before_date
    WHERE animals.status = 'engorde'
    GROUP BY animals.species
  `);

  // Ganancia diaria de peso (GDP) por especie.
  const dailyGain = await prisma.$queryRawUnsafe<
    { species: string; daily_gain: number }[]
  >(`
    SELECT animals.species AS species,
           AVG(COALESCE((weights.weight - w2.weight) / NULLIF((dates.latest_date - dates.before_date), 0), 0))::float8 AS daily_gain
    FROM animals
    JOIN weights ON weights.animal_id = animals.id
    JOIN (
      SELECT animal_id,
             MAX(weights.date) AS latest_date,
             MIN(weights.date) AS before_date
      FROM weights
      WHERE (SELECT COUNT(*) FROM weights f
             WHERE f.animal_id = weights.animal_id
               AND f.weight >= weights.weight) <= 2
      GROUP BY animal_id
    ) AS dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
    JOIN weights w2 ON w2.animal_id = dates.animal_id AND w2.date = dates.before_date
    WHERE (dates.latest_date - dates.before_date) > 0
      AND animals.status = 'engorde'
    GROUP BY animals.species
  `);

  // Días desde el ingreso (promedio) por especie.
  const daysInRanch = await prisma.$queryRawUnsafe<
    { species: string; days_in_ranch: number }[]
  >(`
    SELECT animals.species AS species,
           AVG(w.days_in_ranch)::float8 AS days_in_ranch
    FROM animals
    JOIN (
      SELECT animal_id, date(NOW()) - MIN(weights.date) AS days_in_ranch
      FROM weights GROUP BY animal_id
    ) AS w ON w.animal_id = animals.id
    WHERE animals.status = 'engorde'
    GROUP BY animals.species
  `);

  const bovineAvg = avgWeight.find((r) => r.species === "bovino");
  const bovineGain = dailyGain.find((r) => r.species === "bovino");
  const bovineDays = daysInRanch.find((r) => r.species === "bovino");

  const [totalAnimals, totalLots, totalPlots, totalSales] = await Promise.all([
    prisma.animal.count(),
    prisma.lot.count(),
    prisma.plot.count(),
    prisma.sale.count(),
  ]);

  return {
    bovineCount: toNum(bovineAvg?.count) ?? 0,
    bovineAverageWeight: toNum(bovineAvg?.average_weight) ?? 0,
    bovineDailyGain: toNum(bovineGain?.daily_gain) ?? 0,
    bovineDaysInRanch: toNum(bovineDays?.days_in_ranch) ?? 0,
    totalAnimals,
    totalLots,
    totalPlots,
    totalSales,
  };
}

export type LatestWeightRow = {
  id: number;
  animal_id: number;
  animal_number: number;
  ranch: string;
  species: string;
  lot_id: number | null;
  lot_number: string | null;
  latest_date: Date;
  last_weight: number;
  before_date: Date;
  former_weight: number;
  days_between_weights: number;
  days_since_last_weight: number;
  weight_change: number;
  daily_gain: number | null;
  status: string;
  purchase_price: number | null;
  provider: string | null;
};

const SORT_COLUMNS: Record<string, string> = {
  animal_number: "animal_number",
  ranch: "ranch",
  species: "species",
  last_weight: "last_weight",
  days_since_last_weight: "days_since_last_weight",
  daily_gain: "daily_gain",
  lot_number: "lot_number",
};

// Replica Animal.latest_weights + search + sort + paginate + growing (engorde).
export async function getLatestWeights(opts: {
  search?: string;
  sort?: string;
  direction?: string;
  page?: number;
  perPage?: number;
}): Promise<{ rows: LatestWeightRow[]; total: number }> {
  const perPage = opts.perPage ?? 50;
  const page = Math.max(1, opts.page ?? 1);
  const offset = (page - 1) * perPage;
  const sortCol = opts.sort ? SORT_COLUMNS[opts.sort] : undefined;
  const orderBy = sortCol ?? "lot_id, animal_number";
  const direction = opts.direction === "desc" ? "DESC" : "ASC";

  const base = `
    FROM animals
    JOIN weights ON weights.animal_id = animals.id
    JOIN (
      SELECT animal_id,
             MAX(weights.date) AS latest_date,
             MIN(weights.date) AS before_date
      FROM weights
      WHERE (SELECT COUNT(*) FROM weights f
             WHERE f.animal_id = weights.animal_id AND f.date > weights.date) < 2
      GROUP BY animal_id
    ) AS dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
    JOIN weights w2 ON w2.animal_id = dates.animal_id AND w2.date = dates.before_date
    LEFT JOIN lots ON lots.id = animals.lot_id
    WHERE animals.status = 'engorde'
  `;

  const search = opts.search?.trim();
  const searchClause = search
    ? ` AND (CAST(animals.animal_number AS text) = $1 OR animals.species ILIKE $1 OR animals.ranch ILIKE $1)`
    : "";
  const params: unknown[] = search ? [search] : [];

  const selectSql = `
    SELECT
      weights.id AS id,
      weights.animal_id AS animal_id,
      animals.animal_number AS animal_number,
      animals.ranch AS ranch,
      animals.species AS species,
      animals.lot_id AS lot_id,
      lots.number AS lot_number,
      dates.latest_date AS latest_date,
      weights.weight AS last_weight,
      dates.before_date AS before_date,
      w2.weight AS former_weight,
      (dates.latest_date - dates.before_date) AS days_between_weights,
      (date(NOW()) - dates.latest_date) AS days_since_last_weight,
      (weights.weight - w2.weight) AS weight_change,
      ((weights.weight - w2.weight) / NULLIF((dates.latest_date - dates.before_date), 0))::float8 AS daily_gain,
      animals.status AS status,
      animals.purchase_price AS purchase_price,
      animals.provider AS provider
    ${base}${searchClause}
    ORDER BY ${orderBy} ${direction}
    LIMIT ${perPage} OFFSET ${offset}
  `;

  const countSql = `SELECT COUNT(*)::float8 AS total ${base}${searchClause}`;

  const rows = await prisma.$queryRawUnsafe<LatestWeightRow[]>(
    selectSql,
    ...params,
  );
  const countRes = await prisma.$queryRawUnsafe<{ total: number }[]>(
    countSql,
    ...params,
  );

  return {
    rows: rows.map((r) => ({
      ...r,
      daily_gain: toNum(r.daily_gain),
      weight_change: toNum(r.weight_change) ?? 0,
      days_since_last_weight: toNum(r.days_since_last_weight) ?? 0,
      days_between_weights: toNum(r.days_between_weights) ?? 0,
    })),
    total: toNum(countRes[0]?.total) ?? 0,
  };
}

export type LotStatRow = {
  ranch: string | null;
  species: string | null;
  lot_id: number | null;
  number: string | null;
  name: string | null;
  count: number;
  average_weight: number | null;
  days_since_last_weight: number | null;
  weight_change: number | null;
  daily_gain: number | null;
};

export async function getLotStats(): Promise<LotStatRow[]> {
  const rows = await prisma.$queryRawUnsafe<LotStatRow[]>(`
    SELECT
      lots.ranch AS ranch,
      lots.species AS species,
      animals.lot_id AS lot_id,
      lots.number AS number,
      lots.name AS name,
      COUNT(DISTINCT weights.animal_id)::float8 AS count,
      AVG(weights.weight)::float8 AS average_weight,
      AVG(date(NOW()) - dates.latest_date)::float8 AS days_since_last_weight,
      AVG(weights.weight - w2.weight)::float8 AS weight_change,
      AVG((weights.weight - w2.weight) / NULLIF((dates.latest_date - dates.before_date), 0))::float8 AS daily_gain
    FROM lots
    LEFT JOIN animals ON lots.id = animals.lot_id
    LEFT JOIN weights ON weights.animal_id = animals.id
    LEFT JOIN (
      SELECT animal_id,
             MAX(weights.date) AS latest_date,
             MIN(weights.date) AS before_date
      FROM weights
      WHERE (SELECT COUNT(*) FROM weights f
             WHERE f.animal_id = weights.animal_id AND f.date > weights.date) < 2
      GROUP BY animal_id
    ) AS dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
    JOIN weights w2 ON w2.animal_id = dates.animal_id AND w2.date = dates.before_date
    GROUP BY lots.ranch, lots.species, animals.lot_id, lots.number, lots.name
    ORDER BY lots.ranch, lots.species, lots.number
  `);
  return rows.map((r) => ({
    ...r,
    count: toNum(r.count) ?? 0,
    average_weight: toNum(r.average_weight),
    days_since_last_weight: toNum(r.days_since_last_weight),
    weight_change: toNum(r.weight_change),
    daily_gain: toNum(r.daily_gain),
  }));
}

export type PlotScoreRow = {
  plot_evaluation: number;
  plot_id: number;
  number: number;
  plot_type: string | null;
  ranch: string | null;
  area: number | null;
  water_score: number | null;
  pasture_score: number | null;
  fences_score: number | null;
  average: number | null;
  days_since_last_evaluation: number | null;
};

export async function getLatestPlotScores(): Promise<PlotScoreRow[]> {
  const rows = await prisma.$queryRawUnsafe<PlotScoreRow[]>(`
    SELECT
      plot_evaluations.id AS plot_evaluation,
      plot_evaluations.plot_id AS plot_id,
      CAST(plots.number AS int) AS number,
      plots.plot_type AS plot_type,
      plots.ranch AS ranch,
      plots.area AS area,
      plot_evaluations.water_score AS water_score,
      plot_evaluations.pasture_score AS pasture_score,
      plot_evaluations.fences_score AS fences_score,
      ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal) / 3, 2)::float8 AS average,
      (date(NOW()) - plot_evaluations.date) AS days_since_last_evaluation
    FROM plots
    JOIN plot_evaluations ON plot_evaluations.plot_id = plots.id
    WHERE (plot_evaluations.plot_id, plot_evaluations.id) IN (
      SELECT plot_id, MAX(id) FROM plot_evaluations GROUP BY plot_id
    )
    ORDER BY plots.ranch, CAST(plots.number AS int)
  `);
  return rows.map((r) => ({
    ...r,
    average: toNum(r.average),
    area: toNum(r.area),
    days_since_last_evaluation: toNum(r.days_since_last_evaluation),
  }));
}

export type SaleStatRow = {
  sale_id: number;
  date: Date | null;
  buyer: string | null;
  animal_count: number;
  sum_weight: number | null;
  avg_weight: number | null;
  sale_total: number | null;
  sale_cost: number | null;
  profit: number | null;
  roi: number | null;
  roia: number | null;
  days_in_ranch: number | null;
  weight_change: number | null;
  daily_gain: number | null;
};

export async function getSaleStats(): Promise<SaleStatRow[]> {
  const rows = await prisma.$queryRawUnsafe<SaleStatRow[]>(`
    SELECT
      sales.id AS sale_id,
      sales.date AS date,
      sales.buyer AS buyer,
      COUNT(DISTINCT animals.id)::float8 AS animal_count,
      SUM(latest_weight.weight)::float8 AS sum_weight,
      AVG(latest_weight.weight)::float8 AS avg_weight,
      SUM(animals.sale_price * latest_weight.weight)::float8 AS sale_total,
      SUM(animals.purchase_price * first_weight.weight)::float8 AS sale_cost,
      (SUM(animals.sale_price * latest_weight.weight) - SUM(animals.purchase_price * first_weight.weight))::float8 AS profit,
      ((SUM(animals.sale_price * latest_weight.weight) - SUM(animals.purchase_price * first_weight.weight)) / NULLIF(SUM(animals.purchase_price * first_weight.weight), 0))::float8 AS roi,
      ((SUM(animals.sale_price * latest_weight.weight) - SUM(animals.purchase_price * first_weight.weight)) / NULLIF(SUM(animals.purchase_price * first_weight.weight), 0) * (365 / NULLIF(AVG(dates.latest_date - dates.first_date), 0)))::float8 AS roia,
      AVG(dates.latest_date - dates.first_date)::float8 AS days_in_ranch,
      SUM(latest_weight.weight - first_weight.weight)::float8 AS weight_change,
      AVG((latest_weight.weight - first_weight.weight) / NULLIF((dates.latest_date - dates.first_date), 0))::float8 AS daily_gain
    FROM sales
    JOIN animals ON animals.sale_id = sales.id
    JOIN (
      SELECT animal_id, MIN(date) AS first_date, MAX(date) AS latest_date
      FROM weights GROUP BY weights.animal_id
    ) AS dates ON dates.animal_id = animals.id
    JOIN weights latest_weight ON latest_weight.animal_id = animals.id AND dates.latest_date = latest_weight.date
    JOIN weights first_weight ON first_weight.animal_id = animals.id AND dates.first_date = first_weight.date
    GROUP BY sales.id
    ORDER BY sales.date DESC NULLS LAST
  `);
  return rows.map((r) => ({
    ...r,
    animal_count: toNum(r.animal_count) ?? 0,
    sum_weight: toNum(r.sum_weight),
    avg_weight: toNum(r.avg_weight),
    sale_total: toNum(r.sale_total),
    sale_cost: toNum(r.sale_cost),
    profit: toNum(r.profit),
    roi: toNum(r.roi),
    roia: toNum(r.roia),
    days_in_ranch: toNum(r.days_in_ranch),
    weight_change: toNum(r.weight_change),
    daily_gain: toNum(r.daily_gain),
  }));
}
