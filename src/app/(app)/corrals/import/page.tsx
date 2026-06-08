import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { importCorralsFromKmz } from "@/actions/corrals";
import { Card } from "@/components/ui";
import { Field, SubmitButton, FormError } from "@/components/forms";
import { ArrowLeftIcon, CorralIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ImportCorralsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireEditor();
  const { error } = await searchParams;

  return (
    <div>
      <Link
        href="/corrals"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Corrales
      </Link>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
        Importar corrales desde Google Earth
      </h1>
      <p className="mb-5 text-sm text-slate-500">
        Sube un archivo <span className="font-semibold">.kmz</span> o{" "}
        <span className="font-semibold">.kml</span>. Cada punto (marcador) se
        convierte en un corral.
      </p>

      <form action={importCorralsFromKmz}>
        <Card className="space-y-5 p-5 sm:p-6">
          <FormError message={error} />

          <Field
            label="Archivo .kmz / .kml"
            hint="Exporta tus corrales (marcadores) desde Google Earth como KMZ."
          >
            <input
              type="file"
              name="file"
              accept=".kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml"
              required
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-brand-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
            />
          </Field>

          <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
            <p className="mb-1 flex items-center gap-1.5 font-semibold">
              <CorralIcon width={16} height={16} /> Cómo funciona
            </p>
            <ul className="ml-5 list-disc space-y-0.5 text-brand-800">
              <li>
                El <strong>nombre</strong> de cada punto se usa como{" "}
                <strong>número de corral</strong>.
              </li>
              <li>
                Las <strong>coordenadas</strong> del punto se guardan como{" "}
                <strong>latitud y longitud</strong>.
              </li>
              <li>
                Si ya existe un corral con ese número se{" "}
                <strong>actualiza</strong>; si no, se <strong>crea</strong>.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <SubmitButton>Importar corrales</SubmitButton>
            <Link
              href="/corrals"
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
