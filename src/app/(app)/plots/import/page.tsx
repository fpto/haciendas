import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { importPlotsFromKmz } from "@/actions/plots";
import { Card } from "@/components/ui";
import { Field, Select, SubmitButton, FormError } from "@/components/forms";
import { ArrowLeftIcon, PlotIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const TYPES = ["pastoreo", "agrícola", "reserva", "corral"];

export default async function ImportPlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireEditor();
  const { error } = await searchParams;

  return (
    <div>
      <Link
        href="/plots"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Potreros
      </Link>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        Importar potreros desde Google Earth
      </h1>
      <p className="mb-5 text-sm text-slate-500">
        Sube un archivo <span className="font-semibold">.kmz</span> o{" "}
        <span className="font-semibold">.kml</span>. Cada polígono se convierte
        en un potrero.
      </p>

      <form action={importPlotsFromKmz}>
        <Card className="space-y-5 p-5 sm:p-6">
          <FormError message={error} />

          <Field
            label="Archivo .kmz / .kml"
            hint="Exporta tus potreros desde Google Earth como KMZ."
          >
            <input
              type="file"
              name="file"
              accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            />
          </Field>

          <Field label="Tipo" hint="Se asigna a todos los potreros importados.">
            <Select name="plot_type" defaultValue="">
              <option value="">— Sin tipo —</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>

          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
            <p className="mb-1 flex items-center gap-1.5 font-semibold">
              <PlotIcon width={16} height={16} /> Cómo funciona
            </p>
            <ul className="ml-5 list-disc space-y-0.5 text-brand-800">
              <li>
                El <strong>nombre</strong> de cada polígono se usa como{" "}
                <strong>número de potrero</strong>.
              </li>
              <li>
                El <strong>área en hectáreas</strong> se calcula
                automáticamente.
              </li>
              <li>
                Los <strong>linderos</strong> se guardan como GeoJSON.
              </li>
              <li>
                Si ya existe un potrero con ese número se{" "}
                <strong>actualiza</strong>; si no, se <strong>crea</strong>.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <SubmitButton>Importar potreros</SubmitButton>
            <Link
              href="/plots"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
}
