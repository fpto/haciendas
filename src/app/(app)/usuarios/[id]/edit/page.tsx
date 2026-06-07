import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { updateUser } from "@/actions/users";
import { UserForm } from "@/components/entity-forms/UserForm";
import { ArrowLeftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const userId = Number(id);
  if (Number.isNaN(userId)) notFound();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  return (
    <div>
      <Link
        href="/usuarios"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Usuarios
      </Link>
      <h1 className="mb-5 text-2xl font-bold tracking-tight text-slate-900">
        Editar usuario
      </h1>
      <UserForm
        action={updateUser.bind(null, user.id)}
        user={user}
        error={error}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
