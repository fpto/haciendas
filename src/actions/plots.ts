"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireEditor, requireAdmin } from "@/lib/auth";
import { str, float } from "@/actions/helpers";
import { parseKmzOrKml, ringToGeoJson } from "@/lib/kml";
import { HACIENDA_NAME } from "@/lib/brand";

function plotData(formData: FormData) {
  return {
    number: str(formData.get("number")),
    area: float(formData.get("area")),
    ranch: HACIENDA_NAME,
    plotType: str(formData.get("plot_type")),
    comment: str(formData.get("comment")),
    boundaries: str(formData.get("boundaries")),
  };
}

export async function createPlot(formData: FormData) {
  await requireEditor();
  const plot = await prisma.plot.create({ data: plotData(formData) });
  revalidatePath("/plots");
  redirect(`/plots/${plot.id}?notice=Potrero creado correctamente`);
}

export async function updatePlot(id: number, formData: FormData) {
  await requireEditor();
  await prisma.plot.update({ where: { id }, data: plotData(formData) });
  revalidatePath("/plots");
  revalidatePath(`/plots/${id}`);
  redirect(`/plots/${id}?notice=Potrero actualizado correctamente`);
}

export async function deletePlot(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.plot.delete({ where: { id } });
  revalidatePath("/plots");
  redirect("/plots?notice=Potrero eliminado");
}

// Importa potreros desde un archivo .kmz/.kml de Google Earth.
// Cada polígono (Placemark) se convierte en un potrero: su nombre se usa como
// número, los linderos se guardan como GeoJSON y el área se calcula en hectáreas.
// Si ya existe un potrero con ese número se actualiza; de lo contrario se crea.
export async function importPlotsFromKmz(formData: FormData) {
  await requireEditor();

  const file = formData.get("file");
  const ranch = HACIENDA_NAME;
  const plotType = str(formData.get("plot_type"));

  if (!file || typeof file === "string" || file.size === 0) {
    redirect("/plots/import?error=Selecciona un archivo .kmz o .kml válido");
  }

  const bytes = new Uint8Array(await (file as File).arrayBuffer());

  let polygons;
  try {
    polygons = await parseKmzOrKml(bytes);
  } catch {
    redirect(
      "/plots/import?error=No se pudo leer el archivo. ¿Es un .kmz/.kml válido?",
    );
  }

  if (!polygons || polygons.length === 0) {
    redirect(
      "/plots/import?error=No se encontraron polígonos (potreros) en el archivo",
    );
  }

  let created = 0;
  let updated = 0;

  for (const poly of polygons) {
    const number = poly.name;
    const data = {
      number,
      ranch,
      plotType,
      area: poly.areaHectares,
      boundaries: ringToGeoJson(poly.ring),
      comment: poly.description,
    };

    const existing = await prisma.plot.findFirst({
      where: { number, ...(ranch ? { ranch } : {}) },
    });

    if (existing) {
      // No sobrescribimos hacienda/tipo si ya los tenía y no se indicaron.
      await prisma.plot.update({
        where: { id: existing.id },
        data: {
          number,
          area: poly.areaHectares,
          boundaries: ringToGeoJson(poly.ring),
          ranch: ranch ?? existing.ranch,
          plotType: plotType ?? existing.plotType,
          comment: poly.description ?? existing.comment,
        },
      });
      updated++;
    } else {
      await prisma.plot.create({ data });
      created++;
    }
  }

  revalidatePath("/plots");
  redirect(
    `/plots?notice=${created} potrero(s) creado(s) y ${updated} actualizado(s) desde el archivo`,
  );
}
