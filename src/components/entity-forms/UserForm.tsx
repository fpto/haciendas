import Link from "next/link";
import type { User } from "@prisma/client";
import { Card } from "@/components/ui";
import {
  Field,
  Input,
  Select,
  SubmitButton,
  FormError,
} from "@/components/forms";

export function UserForm({
  action,
  user,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  user?: User | null;
  error?: string;
  submitLabel: string;
}) {
  const isEdit = Boolean(user);
  return (
    <form action={action}>
      <Card className="space-y-5 p-5 sm:p-6">
        <FormError message={error} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nombre" hint="Opcional">
            <Input
              name="first_name"
              defaultValue={user?.firstName ?? ""}
              placeholder="Ej. María"
            />
          </Field>
          <Field label="Apellido" hint="Opcional">
            <Input
              name="last_name"
              defaultValue={user?.lastName ?? ""}
              placeholder="Ej. González"
            />
          </Field>
        </div>
        <Field label="Correo electrónico">
          <Input
            type="email"
            name="email"
            defaultValue={user?.email ?? ""}
            placeholder="usuario@correo.com"
            autoComplete="off"
            required
          />
        </Field>
        <Field
          label={isEdit ? "Nueva contraseña" : "Contraseña"}
          hint={
            isEdit
              ? "Déjala en blanco para conservar la contraseña actual"
              : "Mínimo 6 caracteres"
          }
        >
          <Input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required={!isEdit}
          />
        </Field>
        <Field
          label="Rol"
          hint="El lector solo puede ver información; el administrador tiene acceso total."
        >
          <Select name="role" defaultValue={user?.role ?? "viewer"}>
            <option value="viewer">Lector (solo lectura)</option>
            <option value="admin">Administrador (acceso total)</option>
          </Select>
        </Field>
        <div className="flex items-center gap-3 pt-1">
          <SubmitButton>{submitLabel}</SubmitButton>
          <Link
            href="/usuarios"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Link>
        </div>
      </Card>
    </form>
  );
}
