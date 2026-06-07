import { cookies } from "next/headers";
import { ACTIVE_HACIENDA_COOKIE } from "@/lib/activeHaciendaCookie";

// Hacienda "activa" seleccionada en la barra lateral. Se guarda el NOMBRE en una
// cookie legible por el servidor (igual que la unidad de peso) para que pueda
// usarse como contexto/predeterminado en toda la app. Valor vacío = todas.

export { ACTIVE_HACIENDA_COOKIE };

export async function getActiveHacienda(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(ACTIVE_HACIENDA_COOKIE)?.value?.trim();
  return value ? value : null;
}
