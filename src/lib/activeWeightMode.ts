import "server-only";
import { prisma } from "@/lib/db";
import { getActiveHacienda } from "@/lib/activeHacienda";
import { normalizeWeightMode, type WeightMode } from "@/lib/weightMode";

// Modo de medición de peso de la hacienda activa. Devuelve null cuando no hay
// hacienda seleccionada ("Todas las haciendas") o la seleccionada no existe,
// en cuyo caso la app se comporta de forma global (sin un modo específico).
export async function getActiveWeightMode(): Promise<WeightMode | null> {
  const name = await getActiveHacienda();
  if (!name) return null;
  const hacienda = await prisma.hacienda.findUnique({
    where: { name },
    select: { weightMode: true },
  });
  if (!hacienda) return null;
  return normalizeWeightMode(hacienda.weightMode);
}
