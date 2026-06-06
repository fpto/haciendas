import Link from "next/link";
import { Card } from "@/components/ui";

export default function AccesoDenegadoPage() {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-500">
          No tienes los permisos necesarios para realizar esta acción. Contacta
          a un administrador si crees que es un error.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Volver al tablero
        </Link>
      </Card>
    </div>
  );
}
