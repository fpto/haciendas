import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createUser } from "@/actions/users";
import { UserForm } from "@/components/entity-forms/UserForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  return (
    <div>
      <Link
        href="/usuarios"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Usuarios
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Nuevo usuario
      </h1>
      <UserForm action={createUser} error={error} submitLabel="Crear usuario" />
    </div>
  );
}
