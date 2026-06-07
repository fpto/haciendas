import { cookies } from "next/headers";

// Hacienda "activa" seleccionada en la barra lateral. Se guarda el NOMBRE en una
// cookie legible por el servidor (igual que la unidad de peso) para que pueda
// usarse como contexto/predeterminado en toda la app. Valor vacío = todas.

export const ACTIVE_HACIENDA_COOKIE = "active_hacienda";

export async function getActiveHacienda(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(ACTIVE_HACIENDA_COOKIE)?.value?.trim();
  return value ? value : null;
}
