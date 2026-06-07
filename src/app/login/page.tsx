import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Field, Input, FormError } from "@/components/forms";
import { BullHeadIcon } from "@/components/icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <BullHeadIcon width={28} height={28} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Haciendas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión ganadera — inicia sesión para continuar
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form action="/api/login" method="post" className="space-y-4">
            <FormError message={error} />
            <Field label="Correo electrónico">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </Field>
            <button
              type="submit"
              className="w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
