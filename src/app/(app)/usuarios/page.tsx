import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin, roleLabel } from "@/lib/auth";
import { deleteUser } from "@/actions/users";
import {
  PageHeader,
  EmptyState,
  TableWrap,
  Th,
  Td,
  Badge,
} from "@/components/ui";
import { DeleteButton } from "@/components/DeleteButton";
import { UsersIcon, EditIcon } from "@/components/icons";
import { fmtNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const current = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={`${fmtNumber(users.length)} usuarios · administradores y lectores`}
        action={{ href: "/usuarios/new", label: "Nuevo usuario" }}
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<UsersIcon width={26} height={26} />}
          title="Sin usuarios"
          description="Crea el primer usuario para dar acceso a la aplicación."
          action={{ href: "/usuarios/new", label: "Nuevo usuario" }}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Rol</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const name = [u.firstName, u.lastName]
                .filter(Boolean)
                .join(" ");
              const isSelf = u.id === current.id;
              return (
                <tr key={u.id} className="transition hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">
                    {name || "—"}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        (tú)
                      </span>
                    )}
                  </Td>
                  <Td>{u.email ?? "—"}</Td>
                  <Td>
                    <Badge color={u.role === "admin" ? "green" : "slate"}>
                      {roleLabel(u.role)}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/usuarios/${u.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        <EditIcon width={16} height={16} /> Editar
                      </Link>
                      {!isSelf && (
                        <DeleteButton
                          action={deleteUser}
                          id={u.id}
                          confirmText={`¿Eliminar al usuario ${u.email}? Esta acción no se puede deshacer.`}
                        />
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
