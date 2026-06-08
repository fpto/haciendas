import "server-only";
import { prisma } from "@/lib/db";
import { HACIENDA_NAME } from "@/lib/brand";
import { normalizeWeightMode, type WeightMode } from "@/lib/weightMode";

// La aplicación gestiona una única hacienda (Nueva Joya). Su configuración vive
// en un registro singleton de la tabla `haciendas`. Estas funciones lo leen y
// garantizan su existencia.

// Devuelve el registro de configuración de la hacienda, creándolo si aún no
// existe. Se usa al guardar la configuración para tener siempre un id válido.
export async function getHaciendaSettings() {
  const existing = await prisma.hacienda.findFirst({ orderBy: { id: "asc" } });
  if (existing) return existing;
  return prisma.hacienda.create({ data: { name: HACIENDA_NAME } });
}

// Modo de medición de peso configurado para la hacienda. Si aún no hay registro
// de configuración se usa el valor por defecto ("Por Lote").
export async function getWeightMode(): Promise<WeightMode> {
  const settings = await prisma.hacienda.findFirst({
    select: { weightMode: true },
    orderBy: { id: "asc" },
  });
  return normalizeWeightMode(settings?.weightMode);
}
