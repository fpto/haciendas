import { Select } from "@/components/forms";

// Dropdown de hacienda. Guarda el NOMBRE en el campo `ranch` (compatible con
// los datos y consultas existentes). Si el valor actual no está en la lista
// (dato heredado), se conserva como opción seleccionada.
export function RanchSelect({
  haciendas,
  defaultValue,
  name = "ranch",
}: {
  haciendas: { id: number; name: string }[];
  defaultValue?: string | null;
  name?: string;
}) {
  const current = defaultValue ?? "";
  const known = haciendas.some((h) => h.name === current);

  return (
    <Select name={name} defaultValue={current}>
      <option value="">— Selecciona hacienda —</option>
      {haciendas.map((h) => (
        <option key={h.id} value={h.name}>
          {h.name}
        </option>
      ))}
      {current && !known && (
        <option value={current}>{current} (sin registrar)</option>
      )}
    </Select>
  );
}
